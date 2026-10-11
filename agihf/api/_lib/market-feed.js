// api/_lib/market-feed.js — A Girl & Her Futures™
//
// Live data for the Dayli Desk, both public and the same for every member,
// so they are served without sign-in and cached at Vercel's edge:
//   GET /api/market → MNQ and Gold structure (4H, 1H, swings, PIL)
//   GET /api/news   → this week's calendar from Forex Factory
//
// Candles come from Yahoo Finance's public chart feed (NQ=F for the Nasdaq
// 100 future, which moves point for point with MNQ, and GC=F for gold).
// It's delayed and unofficial, which is fine for drawing structure, and the
// fetch is isolated here so a licensed feed can replace it later.

import { buildOutlook } from './market-structure.js';

const SYMBOLS = [
  { key: 'mnq', yahoo: 'NQ=F', symbol: 'MNQ', name: 'Micro Nasdaq' },
  { key: 'gc', yahoo: 'GC=F', symbol: 'GC', name: 'Gold' },
];

const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; AGHF-Desk/1.0)', Accept: 'application/json' };

// Warm-instance memo on top of the edge cache, so a burst of members
// opening the Desk costs one upstream call.
const memo = new Map();
async function remember(key, ms, fn) {
  const hit = memo.get(key);
  if (hit && Date.now() - hit.at < ms) return hit.value;
  const value = await fn();
  memo.set(key, { at: Date.now(), value });
  return value;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${new URL(url).host} ${res.status}`);
  return res.json();
}

async function hourlyBars(yahoo) {
  const path = `/v8/finance/chart/${encodeURIComponent(yahoo)}?interval=60m&range=1mo&includePrePost=true`;
  let data;
  try {
    data = await fetchJson(`https://query1.finance.yahoo.com${path}`);
  } catch {
    data = await fetchJson(`https://query2.finance.yahoo.com${path}`);
  }
  const r = data?.chart?.result?.[0];
  const q = r?.indicators?.quote?.[0];
  if (!r?.timestamp || !q) throw new Error(`No candles for ${yahoo}`);
  return r.timestamp.map((t, i) => ({ t, o: q.open[i], h: q.high[i], l: q.low[i], c: q.close[i] }));
}

export async function getMarket() {
  return remember('market', 4 * 60 * 1000, async () => {
    const markets = await Promise.all(SYMBOLS.map(async (s) => {
      try {
        const outlook = buildOutlook(await hourlyBars(s.yahoo));
        return outlook ? { key: s.key, symbol: s.symbol, name: s.name, ...outlook } : { key: s.key, symbol: s.symbol, name: s.name, error: 'not enough candles' };
      } catch (err) {
        console.error(`Market feed ${s.yahoo}:`, err.message);
        return { key: s.key, symbol: s.symbol, name: s.name, error: 'unavailable' };
      }
    }));
    if (markets.every((m) => m.error)) throw new Error('every market feed failed');
    return { markets, source: 'Yahoo Finance (delayed)', generatedAt: new Date().toISOString() };
  });
}

export async function getNews() {
  return remember('news', 20 * 60 * 1000, async () => {
    const rows = await fetchJson('https://nfs.faireconomy.media/ff_calendar_thisweek.json');
    const events = (Array.isArray(rows) ? rows : [])
      .filter((e) => e && e.title && e.date)
      .map((e) => ({
        title: String(e.title),
        currency: String(e.country || ''),
        impact: String(e.impact || ''),
        date: String(e.date),
        forecast: e.forecast ? String(e.forecast) : '',
        previous: e.previous ? String(e.previous) : '',
      }));
    return { events, source: 'Forex Factory', generatedAt: new Date().toISOString() };
  });
}

/** Public handler: ?resource=market | news. */
export async function handlePublicFeed(req, res, which) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  try {
    const body = which === 'market' ? await getMarket() : await getNews();
    const maxAge = which === 'market' ? 300 : 1800;
    res.setHeader('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`);
    return res.status(200).json(body);
  } catch (err) {
    console.error(`Public feed ${which}:`, err.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: `The ${which} feed is unavailable right now.` });
  }
}
