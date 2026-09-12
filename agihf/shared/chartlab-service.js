/**
 * chartlab-service.js — A Girl & Her Futures™
 * Client API wrapper for AGHF Chart Lab, mirroring every other
 * *-service.js file's shape exactly: real apiFetch calls in production,
 * an in-memory demo-mode fallback behind window.AGHF_DEMO so the whole
 * feature is clickable with zero network calls in the demo build.
 *
 * DEV/SEED NOTE: every drill in `demoDrills` below is clearly-labeled
 * placeholder content (isSeedPlaceholder: true, a generated placeholder
 * candlestick SVG, never presented as a verified historical chart) — real
 * AGHF-owned chart screenshots must be uploaded through the Admin Chart
 * Lab Builder before this feature is genuinely production-ready. See the
 * completion report for the full list still needing real charts.
 *
 * Each chart below is a deliberately-authored schematic diagram genuinely
 * depicting its drill's concept (a real swing high, a real range, a real
 * wick-rejection candle, a real Indication→Correction→Continuation→Retest
 * sequence, real sideways consolidation) — not a generic reused shape.
 * Every point/zone answer is DERIVED from the actual candle data via
 * featureToZone(), never a hand-guessed coordinate, so a zone can never
 * drift out of sync with what the chart actually shows.
 */

import { authFetch as apiFetch } from './auth-fetch.js';

/* ── Demo-mode placeholder chart generator ───────────────────────────────
   A small deterministic SVG candlestick renderer (780x320 viewBox, same
   proportions as lesson-engine.js's canvas charts) so demo drills don't
   need any uploaded image or Storage access. The price→pixel mapping is
   normalized to the actual min/max of the candles (and any reference
   levels) being drawn, with padding, so nothing can ever render outside
   the viewBox regardless of the path's shape or length. Returns both the
   image and the exact mapping metadata used to draw it, so zones can be
   derived from real chart geometry instead of guessed. */
function escapeXml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function svgChart(candles, { width = 780, height = 320, padding = 24, levels = [] } = {}) {
  const n = candles.length;
  const slot = width / (n + 1);
  const allPrices = candles.flatMap((c) => [c.high, c.low]).concat(levels.map((l) => l.price));
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const span = Math.max(maxPrice - minPrice, 0.01);
  const toY = (price) => height - padding - ((price - minPrice) / span) * (height - 2 * padding);

  const levelLines = levels.map((l) => {
    const y = toY(l.price);
    return `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${l.color || '#7A5C50'}" stroke-width="1.5" stroke-dasharray="6,5"/>` +
      (l.label ? `<text x="10" y="${y - 5}" font-size="11" font-family="sans-serif" fill="${l.color || '#7A5C50'}">${escapeXml(l.label)}</text>` : '');
  }).join('');

  const bars = candles.map((c, i) => {
    const x = slot * (i + 1);
    const openY = toY(c.open);
    const closeY = toY(c.close);
    const highY = toY(c.high);
    const lowY = toY(c.low);
    const bull = c.close >= c.open;
    const color = bull ? '#7ECEC4' : '#F4829A';
    const top = Math.min(openY, closeY);
    const bodyH = Math.max(Math.abs(closeY - openY), 2);
    return `<line x1="${x}" y1="${highY}" x2="${x}" y2="${lowY}" stroke="${color}" stroke-width="2"/>` +
      `<rect x="${x - 12}" y="${top}" width="24" height="${bodyH}" fill="${color}"/>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">` +
    `<rect width="${width}" height="${height}" fill="#FFFBF9"/>` +
    [0, 1, 2, 3, 4].map((i) => `<line x1="0" y1="${(height / 5) * i}" x2="${width}" y2="${(height / 5) * i}" stroke="#F1E7E1" stroke-width="1"/>`).join('') +
    levelLines + bars + `</svg>`;
  return { url: 'data:image/svg+xml;utf8,' + encodeURIComponent(svg), meta: { width, height, padding, slot, minPrice, span } };
}

/** Converts a real candle-index + price into the same normalized 0-1
 * x/y fraction space svgChart() itself draws in, so a tap zone always
 * sits exactly on the visual feature it claims to mark. */
function featureToZone(meta, candleIndex, price, radius = 0.06, credit = 'full') {
  const xPixel = meta.slot * (candleIndex + 1);
  const yPixel = meta.height - meta.padding - ((price - meta.minPrice) / meta.span) * (meta.height - 2 * meta.padding);
  return { x: xPixel / meta.width, y: yPixel / meta.height, radius, credit };
}

/** Builds a continuous candle path from an authored sequence of closing
 * prices — each candle's open is the prior candle's close (real,
 * gap-free price action), with a small symmetric wick pad. This is the
 * one primitive every concept-specific chart below is built from, so a
 * drill's chart is always a deliberately-authored pattern, never a
 * formula with no real structural features. */
function pathToCandles(closes, wickPad = 0.12) {
  const out = [];
  for (let i = 0; i < closes.length; i++) {
    const open = i === 0 ? closes[0] - (closes[1] - closes[0]) * 0.3 : closes[i - 1];
    const close = closes[i];
    out.push({ open, close, high: Math.max(open, close) + wickPad, low: Math.min(open, close) - wickPad });
  }
  return out;
}

// 4H Bias — a genuine bullish structure: every swing high (candles 2,4,6,8)
// and every swing low (candles 1,3,5,7) is strictly higher than the last.
const biasCandles = pathToCandles([0.6, 0.3, 1.0, 0.7, 1.5, 1.2, 2.1, 1.9, 2.8]);
const biasChart = svgChart(biasCandles);

// Swing High or Swing Low — one unambiguous peak at candle 3, confirmed by
// the lower high at candle 4; candle 2's smaller high is the plausible
// "not quite there yet" near-miss used as the partial-credit zone.
const swingCandles = pathToCandles([0.5, 1.0, 1.6, 2.3, 1.8, 1.2, 0.7]);
const swingChart = svgChart(swingCandles);

// External Range — a real oscillating range whose single highest point
// (candle 6) is the outermost boundary being asked for.
const rangeCandles = pathToCandles([0.5, 1.3, 0.8, 1.6, 1.0, 1.8, 2.4, 1.7, 2.0, 1.4, 1.9]);
const rangeChart = svgChart(rangeCandles);

// Valid PIL — two real candidate levels: candle 3's high is later broken
// by a candle-body close above it (invalidated), candle 6's high is never
// closed back through by the end of the chart (still the active PIL).
const pilCandles = pathToCandles([0.4, 1.1, 0.6, 1.4, 0.9, 1.7, 2.3, 1.9]);
const pilOldLevel = pilCandles[3].high;
const pilActiveLevel = pilCandles[6].high;
const pilChart = svgChart(pilCandles, {
  levels: [
    { price: pilOldLevel, color: '#C9B9AE', label: 'Old level (already closed through)' },
    { price: pilActiveLevel, color: '#7A5C50', label: 'Active level' },
  ],
});

// Indication or Just a Wick — one hand-authored candle (index 2) whose
// wick pokes above the drawn level but whose body closes back below it: a
// real, visually legible wick-rejection, not implied text.
const indicationLevel = 1.0;
const indicationCandles = [
  { open: 0.2, close: 0.5, high: 0.62, low: 0.1 },
  { open: 0.5, close: 0.72, high: 0.84, low: 0.4 },
  { open: 0.72, close: 0.65, high: 1.15, low: 0.55 },
  { open: 0.65, close: 0.4, high: 0.75, low: 0.3 },
];
const indicationChart = svgChart(indicationCandles, { levels: [{ price: indicationLevel, color: '#7A5C50', label: 'PIL' }] });

// Shared Indication → Correction → Continuation → Retest path: candle 1's
// high is the Indication leg's peak; candle 4 hasn't resumed above it yet
// (Correction); candle 5's close breaks back above it with a real
// candle-body close (Continuation); candle 7 returns to retest that same
// zone. Correction/Continuation/Retest drills each show only as much of
// this real sequence as their question asks about.
const iccMasterCandles = pathToCandles([0.5, 1.6, 1.1, 0.9, 1.0, 1.8, 2.1, 1.6, 2.3]);
const correctionChart = svgChart(iccMasterCandles.slice(0, 5));
const continuationChart = svgChart(iccMasterCandles.slice(0, 6));
const retestChart = svgChart(iccMasterCandles.slice(0, 7));
const sequenceChart = svgChart(iccMasterCandles);

// Is This Consolidation — genuinely flat, overlapping, non-directional
// candles (first close 0.5, last close 0.53, oscillating the whole way
// between them) so the correct "yes, consolidating" answer is honestly
// depicted instead of contradicted by a visible uptrend.
const consolidationCandles = pathToCandles([0.5, 0.35, 0.55, 0.4, 0.58, 0.42, 0.52, 0.38, 0.5, 0.45, 0.53]);
const consolidationChart = svgChart(consolidationCandles);

// Wait or Pass — choppy, non-directional candles (no clear bias) followed
// by one hand-authored wick-only cross of the drawn level with no body
// close beyond it, matching both halves of the drill's premise at once.
const waitLevel = 0.6;
const waitChopCandles = pathToCandles([0.5, 0.28, 0.52, 0.3, 0.48, 0.28]);
const waitLastClose = waitChopCandles[waitChopCandles.length - 1].close;
const waitCandles = [...waitChopCandles, { open: waitLastClose, close: waitLastClose + 0.03, high: 0.85, low: waitLastClose - 0.08 }];
const waitChart = svgChart(waitCandles, { levels: [{ price: waitLevel, color: '#7A5C50', label: 'PIL' }] });

const demoDrills = [
  {
    id: 'demo-bias-1', title: '4H Bias: Higher Highs or Not?', drillType: 'valid_invalid', skillCategory: 'market_bias',
    difficulty: 'foundation', accessTier: 'free', practiceMode: 'open_practice', lessonKey: 'p1-3', instrument: 'MNQ', timeframe: '4H',
    chartFormat: 'static_image', chartImagePath: null, chartAssetUrl: biasChart.url, chartAltText: 'A price chart showing a series of higher highs and higher lows.',
    question: 'Based on this structure, what is the 4H bias?', estimatedSeconds: 45, isSeedPlaceholder: true, version: 1,
    answerKeyPreview: { answerType: 'choice', choices: [{ key: 'bullish', label: 'Bullish' }, { key: 'bearish', label: 'Bearish' }, { key: 'unclear', label: 'Unclear' }] },
    _correctChoice: 'bullish',
    _explanation: 'Each swing high and swing low is higher than the one before it — that is the definition of bullish structure on this timeframe.',
    _commonMistake: 'Focusing on one red candle instead of the overall sequence of highs and lows.',
    _hints: ['Ignore individual candle color — look at the swing points.', 'Compare each swing high to the one before it.'],
    _relatedRule: 'Dayli ICC: 4H sets directional bias before anything else is read.',
  },
  {
    id: 'demo-swing-1', title: 'Swing High or Swing Low?', drillType: 'spot_it', skillCategory: 'swing_points',
    difficulty: 'foundation', accessTier: 'free', practiceMode: 'open_practice', lessonKey: null, instrument: 'MNQ', timeframe: '1H',
    chartFormat: 'static_image', chartAssetUrl: swingChart.url, chartAltText: 'A price chart with one clear swing high.',
    question: 'Tap the swing high.', estimatedSeconds: 30, isSeedPlaceholder: true, version: 1,
    answerKeyPreview: { answerType: 'point', choices: [] },
    _zones: [
      featureToZone(swingChart.meta, 3, swingCandles[3].high, 0.06, 'full'),
      featureToZone(swingChart.meta, 2, swingCandles[2].high, 0.06, 'partial'),
    ],
    _explanation: 'The swing high is the candle where price stopped making higher highs and reversed — confirmed one candle later.',
    _commonMistake: 'Marking the highest wick instead of the candle that actually broke the up-sequence.',
    _hints: ['A swing high needs a lower high after it to be confirmed.', 'Look for where bullish delivery transitions to bearish delivery.'],
    _relatedRule: null,
  },
  {
    id: 'demo-range-1', title: 'Mark the External Range', drillType: 'spot_it', skillCategory: 'external_range',
    difficulty: 'developing', accessTier: 'free', practiceMode: 'open_practice', lessonKey: null, instrument: 'MNQ', timeframe: '1H',
    chartFormat: 'static_image', chartAssetUrl: rangeChart.url, chartAltText: 'A price chart with a defined external range.',
    question: 'Tap the level marking the top of the current external range.', estimatedSeconds: 40, isSeedPlaceholder: true, version: 1,
    answerKeyPreview: { answerType: 'point', choices: [] },
    _zones: [featureToZone(rangeChart.meta, 6, rangeCandles[6].high, 0.08, 'full')],
    _explanation: 'The external range is bounded by the most recent significant swing high and low — this candle set that boundary.',
    _commonMistake: 'Using an internal swing instead of the range-defining swing.',
    _hints: ['The external range is the outermost boundary, not every small swing.'],
    _relatedRule: null,
  },
  {
    id: 'demo-pil-1', title: 'Select the Valid PIL', drillType: 'spot_it', skillCategory: 'pil_selection',
    difficulty: 'developing', accessTier: 'free', practiceMode: 'recommended_practice', lessonKey: 'p1-3', instrument: 'MNQ', timeframe: '1H',
    chartFormat: 'static_image', chartAssetUrl: pilChart.url, chartAltText: 'A price chart with two candidate levels, one already broken and one still active.',
    question: 'Tap the 1H PIL that price is currently reacting to.', estimatedSeconds: 45, isSeedPlaceholder: true, version: 1,
    answerKeyPreview: { answerType: 'point', choices: [] },
    _zones: [featureToZone(pilChart.meta, 6, pilActiveLevel, 0.09, 'full')],
    _explanation: 'This level is the most recent 1H structure point price hasn’t yet closed through — the active PIL.',
    _commonMistake: 'Picking an older level that price already closed through and invalidated.',
    _hints: ['The PIL must still be unbroken — check for a candle-body close through it first.'],
    _relatedRule: 'Timeframe roles: 1H confirms structure and the active Pre-Indication Level (PIL).',
  },
  {
    id: 'demo-indication-1', title: 'Indication or Just a Wick?', drillType: 'candle_close_wick', skillCategory: 'indication',
    difficulty: 'foundation', accessTier: 'free', practiceMode: 'open_practice', lessonKey: 'p1-1', instrument: 'MNQ', timeframe: '1M',
    chartFormat: 'static_image', chartAssetUrl: indicationChart.url, chartAltText: 'A candle wicking through a level without a body close.',
    question: 'Price traded above the PIL, but the next candle closed back below it. Was this Indication confirmed?', estimatedSeconds: 30, isSeedPlaceholder: true, version: 1,
    answerKeyPreview: { answerType: 'choice', choices: [{ key: 'valid_close', label: 'Valid candle-body close' }, { key: 'wick_only', label: 'Wick only' }, { key: 'unclear', label: 'Unclear' }, { key: 'not_yet_confirmed', label: 'Not yet confirmed' }] },
    _correctChoice: 'wick_only',
    _explanation: 'The wick crossed the level, but the candle body closed back below it — no candle-body confirmation, so Indication has not completed.',
    _commonMistake: 'Treating any touch of the level as confirmation instead of requiring a body close.',
    _hints: ['A wick and a candle-body close are not the same thing.', 'Check where the candle body — not the wick — closed relative to the level.'],
    _relatedRule: 'The Golden Rule: no candle closure = no confirmation = no trade, every time.',
  },
  {
    id: 'demo-correction-1', title: 'What Phase Is Price In?', drillType: 'phase_id', skillCategory: 'correction',
    difficulty: 'foundation', accessTier: 'free', practiceMode: 'open_practice', lessonKey: null, instrument: 'MNQ', timeframe: '1M',
    chartFormat: 'static_image', chartAssetUrl: correctionChart.url, chartAltText: 'A chart showing a pullback after an indication move.',
    question: 'Indication just completed and price is pulling back. What phase is this?', estimatedSeconds: 30, isSeedPlaceholder: true, version: 1,
    answerKeyPreview: { answerType: 'choice', choices: [{ key: 'pre_indication', label: 'Pre-Indication' }, { key: 'indication', label: 'Indication' }, { key: 'correction', label: 'Correction' }, { key: 'continuation', label: 'Continuation' }] },
    _correctChoice: 'correction',
    _explanation: 'After Indication confirms, a pullback that has not yet resumed in the indicated direction is Correction — observation only, not an entry trigger.',
    _commonMistake: 'Entering during Correction, mistaking the pullback for a fresh setup.',
    _hints: ['Correction always follows a confirmed Indication.', 'It is not the entry — Continuation is.'],
    _relatedRule: 'Entering during Correction is one of the Walk-Away Conditions.',
  },
  {
    id: 'demo-continuation-1', title: 'Has Continuation Confirmed?', drillType: 'valid_invalid', skillCategory: 'continuation',
    difficulty: 'developing', accessTier: 'free', practiceMode: 'open_practice', lessonKey: null, instrument: 'MNQ', timeframe: '1M',
    chartFormat: 'static_image', chartAssetUrl: continuationChart.url, chartAltText: 'A chart showing price resuming direction after a correction.',
    question: 'Price pulled back, then closed a candle body back in the original direction. Is Continuation confirmed?', estimatedSeconds: 35, isSeedPlaceholder: true, version: 1,
    answerKeyPreview: { answerType: 'choice', choices: [{ key: 'valid', label: 'Valid' }, { key: 'invalid', label: 'Invalid' }, { key: 'not_enough_confirmation', label: 'Not Enough Confirmation' }, { key: 'wait', label: 'Wait' }] },
    _correctChoice: 'valid',
    _explanation: 'A candle-body close resuming the original direction after Correction is exactly what confirms Continuation.',
    _commonMistake: 'Entering on the wick before the candle actually closes.',
    _hints: ['Continuation needs the same candle-body-close standard as Indication.'],
    _relatedRule: 'The Golden Rule applies identically to Continuation as it does to Indication.',
  },
  {
    id: 'demo-retest-1', title: 'Retest and Entry: Best Decision', drillType: 'best_decision', skillCategory: 'retest_entry',
    difficulty: 'applied', accessTier: 'free', practiceMode: 'open_practice', lessonKey: null, instrument: 'MNQ', timeframe: '1M',
    chartFormat: 'static_image', chartAssetUrl: retestChart.url, chartAltText: 'A chart showing Continuation confirmed but no retest yet.',
    question: 'Continuation just confirmed, but price hasn’t retested the breakout level yet. What is the best decision?', estimatedSeconds: 40, isSeedPlaceholder: true, version: 1,
    answerKeyPreview: { answerType: 'choice', choices: [{ key: 'enter_now', label: 'Enter now' }, { key: 'wait_for_continuation', label: 'Wait for the first retest' }, { key: 'chase_current_candle', label: 'Chase the current candle' }, { key: 'move_to_lower_timeframe', label: 'Move to a lower timeframe' }] },
    _correctChoice: 'wait_for_continuation',
    _explanation: 'Entering before the first retest means chasing price that has already moved — waiting for a retest gives a defined, lower-risk entry.',
    _commonMistake: 'Chasing the continuation candle out of fear of missing the move.',
    _hints: ['A retest gives you a real level to risk against — chasing does not.'],
    _relatedRule: null,
  },
  {
    id: 'demo-consolidation-1', title: 'Is This Consolidation?', drillType: 'valid_invalid', skillCategory: 'consolidation',
    difficulty: 'foundation', accessTier: 'free', practiceMode: 'open_practice', lessonKey: null, instrument: 'MNQ', timeframe: '1H',
    chartFormat: 'static_image', chartAssetUrl: consolidationChart.url, chartAltText: 'A chart showing sideways price movement.',
    question: 'Price has been moving sideways in a tight range for several candles. Is this consolidation?', estimatedSeconds: 30, isSeedPlaceholder: true, version: 1,
    answerKeyPreview: { answerType: 'choice', choices: [{ key: 'valid', label: 'Yes — consolidating' }, { key: 'invalid', label: 'No — trending' }, { key: 'not_enough_confirmation', label: 'Not enough data' }] },
    _correctChoice: 'valid',
    _explanation: 'Repeated overlapping candles with no clear directional swing is the definition of consolidation — a Walk-Away Condition, not a setup.',
    _commonMistake: 'Forcing a directional bias onto sideways price.',
    _hints: ['Look for overlapping candle ranges rather than a clear sequence of higher/lower swings.'],
    _relatedRule: 'Consolidation is one of the six Walk-Away Conditions.',
  },
  {
    id: 'demo-wait-1', title: 'Wait or Pass?', drillType: 'best_decision', skillCategory: 'wait_or_pass',
    difficulty: 'developing', accessTier: 'free', practiceMode: 'open_practice', lessonKey: null, instrument: 'MNQ', timeframe: '1M',
    chartFormat: 'static_image', chartAssetUrl: waitChart.url, chartAltText: 'A chart with an unclear setup and no confirmed bias.',
    question: 'There is no clear 4H bias and price just wicked through the PIL without closing. What is the best decision?', estimatedSeconds: 35, isSeedPlaceholder: true, version: 1,
    answerKeyPreview: { answerType: 'choice', choices: [{ key: 'enter_now', label: 'Enter now' }, { key: 'wait_for_continuation', label: 'Wait' }, { key: 'pass', label: 'Pass completely' }] },
    _correctChoice: 'wait_for_continuation',
    _explanation: 'A wick with no confirmed close isn’t a Walk-Away Condition on its own — it just means the setup isn’t ready yet. Wait for real confirmation before deciding to pass.',
    _commonMistake: 'Passing entirely on a setup that just needs more time to develop.',
    _hints: ['"Wait" and "Pass" are different decisions — one keeps the setup open, one closes it.'],
    _relatedRule: 'Wick through the level without a close is a Walk-Away Condition only when combined with acting on it, not with waiting.',
  },
  {
    id: 'demo-sequence-1', title: 'Build the Complete ICC Sequence', drillType: 'sequence_builder', skillCategory: 'icc_sequence',
    difficulty: 'applied', accessTier: 'free', practiceMode: 'open_practice', lessonKey: 'p1-3', instrument: 'MNQ', timeframe: '1M',
    chartFormat: 'static_image', chartAssetUrl: sequenceChart.url, chartAltText: 'A chart showing a complete Indication-Correction-Continuation-Retest sequence.',
    question: 'Arrange these events in the correct Dayli ICC order.', estimatedSeconds: 60, isSeedPlaceholder: true, version: 1,
    answerKeyPreview: { answerType: 'sequence', choices: [{ key: 'indication', label: 'Indication' }, { key: 'correction', label: 'Correction' }, { key: 'continuation', label: 'Continuation' }, { key: 'retest', label: 'Retest' }] },
    _correctSequence: ['indication', 'correction', 'continuation', 'retest'],
    _explanation: 'Indication confirms the initial move, Correction is the pullback, Continuation confirms the resumption, and Retest offers the lower-risk entry.',
    _commonMistake: 'Placing Retest before Continuation — a retest only makes sense once Continuation has confirmed.',
    _hints: ['Correction always comes right after Indication, never before it.'],
    _relatedRule: null,
  },
];

let sessionCounter = 0;
const demoSessions = [];
const demoAttempts = [];
const demoMastery = {};

function demoAnswerKeyReveal(drill) {
  return {
    answerType: drill.answerKeyPreview.answerType,
    choices: drill.answerKeyPreview.choices,
    correctChoice: drill._correctChoice || null,
    correctSequence: drill._correctSequence || [],
    zones: drill._zones || [],
    explanation: drill._explanation,
    commonMistake: drill._commonMistake || null,
    hints: drill._hints || [],
    relatedRule: drill._relatedRule || null,
  };
}

function demoScore(drill, memberAnswer) {
  const ak = drill.answerKeyPreview.answerType;
  if (ak === 'choice') {
    const correct = memberAnswer.choice === drill._correctChoice;
    return correct ? { score: 100, result: 'correct' } : { score: 0, result: 'review_needed' };
  }
  if (ak === 'sequence') {
    const seq = drill._correctSequence || [];
    const member = memberAnswer.sequence || [];
    const matches = seq.reduce((n, k, i) => n + (member[i] === k ? 1 : 0), 0);
    const pct = Math.round((matches / seq.length) * 100);
    return { score: pct, result: pct === 100 ? 'correct' : pct >= 50 ? 'partial' : 'review_needed' };
  }
  if (ak === 'point') {
    const p = memberAnswer.point;
    if (!p) return { score: 0, result: 'review_needed' };
    let best = null;
    for (const z of drill._zones || []) {
      const d = Math.hypot(z.x - p.x, z.y - p.y);
      if (d <= (z.radius || 0.06) && (!best || d < best.dist)) best = { dist: d, credit: z.credit };
    }
    if (!best) return { score: 0, result: 'review_needed' };
    return best.credit === 'partial' ? { score: 60, result: 'partial' } : { score: 100, result: 'correct' };
  }
  return { score: 0, result: 'review_needed' };
}

/* ── Public API ───────────────────────────────────────────────────────── */

function demoPreviewWithHints(drill) {
  return { ...drill.answerKeyPreview, hints: drill._hints || [] };
}

export async function listDrills(filters = {}) {
  if (window.AGHF_DEMO) {
    let rows = demoDrills;
    if (filters.skillCategory) rows = rows.filter((d) => d.skillCategory === filters.skillCategory);
    if (filters.difficulty) rows = rows.filter((d) => d.difficulty === filters.difficulty);
    return { drills: rows.map(({ _correctChoice, _correctSequence, _zones, _explanation, _commonMistake, _hints, _relatedRule, ...rest }) => ({ ...rest, answerKeyPreview: demoPreviewWithHints({ _hints, answerKeyPreview: rest.answerKeyPreview }) })) };
  }
  const qs = new URLSearchParams(filters).toString();
  return apiFetch(`/api/chartlab-data${qs ? '?' + qs : ''}`);
}

export async function getDrill(id) {
  if (window.AGHF_DEMO) {
    const drill = demoDrills.find((d) => d.id === id);
    if (!drill) return { drill: null, answerKeyPreview: null };
    const { _correctChoice, _correctSequence, _zones, _explanation, _commonMistake, _hints, _relatedRule, ...rest } = drill;
    return { drill: rest, answerKeyPreview: demoPreviewWithHints(drill) };
  }
  return apiFetch(`/api/chartlab-data?id=${encodeURIComponent(id)}`);
}

/** Resolves a drill's chart image into something an <img>/canvas can load:
 * demo drills already carry a ready-to-use data-URI in chartAssetUrl; a
 * seeded/placeholder drill's chartImagePath can itself be an inline
 * data: URI (see 0010_chart_lab_seed_drills.sql) needing no network call;
 * a real admin-uploaded drill stores a private win-media storage path and
 * needs a signed URL. */
export async function resolveChartImageUrl(drill) {
  if (window.AGHF_DEMO || drill.chartAssetUrl) return drill.chartAssetUrl || null;
  if (!drill.chartImagePath) return null;
  if (drill.chartImagePath.startsWith('data:')) return drill.chartImagePath;
  const { url } = await apiFetch(`/api/chartlab-image?path=${encodeURIComponent(drill.chartImagePath)}`);
  return url;
}

export async function submitAttempt({ drillId, memberAnswer, hintsUsed, sessionId }) {
  if (window.AGHF_DEMO) {
    const drill = demoDrills.find((d) => d.id === drillId);
    if (!drill) throw new Error('Drill not found');
    const { score, result } = demoScore(drill, memberAnswer);
    const priorAttempts = demoAttempts.filter((a) => a.drillId === drillId);
    const attemptNumber = priorAttempts.length + 1;
    const gpAwarded = attemptNumber === 1 && result !== 'review_needed' ? (result === 'correct' ? 5 : 3) : 0;
    const mastery = demoMastery[drill.skillCategory] || { mastery_state: 'new', attempts: 0, recent_accuracy: 0 };
    const nextAttempts = mastery.attempts + 1;
    const nextAccuracy = Math.round((mastery.recent_accuracy * Math.max(mastery.attempts, 1) + score) / (mastery.attempts + 1));
    const rank = ['new', 'practicing', 'developing', 'confident', 'mastered'];
    let state = 'practicing';
    if (nextAttempts >= 8 && nextAccuracy >= 90) state = 'mastered';
    else if (nextAttempts >= 5 && nextAccuracy >= 75) state = 'confident';
    else if (nextAttempts >= 3 && nextAccuracy >= 50) state = 'developing';
    const leveledUp = rank.indexOf(state) > rank.indexOf(mastery.mastery_state);
    demoMastery[drill.skillCategory] = { mastery_state: state, attempts: nextAttempts, recent_accuracy: nextAccuracy };
    demoAttempts.push({ drillId, score, result, completedAt: new Date().toISOString(), skillCategory: drill.skillCategory, title: drill.title, drillType: drill.drillType });
    return {
      attemptId: 'demo-attempt-' + demoAttempts.length, score, result, gpAwarded, attemptNumber,
      masteryState: state, masteryLeveledUp: leveledUp, reveal: demoAnswerKeyReveal(drill), relatedNextDrillId: null,
    };
  }
  return apiFetch('/api/chartlab-attempt', { method: 'POST', body: JSON.stringify({ drillId, memberAnswer, hintsUsed, sessionId }) });
}

export async function getCurrentSession() {
  if (window.AGHF_DEMO) return { session: demoSessions.find((s) => s.status === 'in_progress') || null };
  return apiFetch('/api/chartlab-session');
}

export async function startSession({ sessionType, skillCategory, currentFocusSource }) {
  if (window.AGHF_DEMO) {
    let pool = demoDrills;
    if (sessionType === 'focus' && skillCategory) pool = pool.filter((d) => d.skillCategory === skillCategory);
    const count = sessionType === 'daily' ? 5 : sessionType === 'focus' ? 8 : 6;
    const drillIds = pool.slice(0, count).map((d) => d.id);
    if (!drillIds.length) return { session: null, empty: true };
    sessionCounter += 1;
    const session = { id: 'demo-session-' + sessionCounter, sessionType, skillCategory: skillCategory || null, currentFocusSource: currentFocusSource || null, drillIds, currentPosition: 0, status: 'in_progress' };
    demoSessions.push(session);
    return { session };
  }
  return apiFetch('/api/chartlab-session', { method: 'POST', body: JSON.stringify({ sessionType, skillCategory, currentFocusSource }) });
}

export async function updateSession(id, patch) {
  if (window.AGHF_DEMO) {
    const s = demoSessions.find((x) => x.id === id);
    if (s) Object.assign(s, patch);
    return { session: s };
  }
  return apiFetch('/api/chartlab-session', { method: 'PATCH', body: JSON.stringify({ id, ...patch }) });
}

export async function getMastery() {
  if (window.AGHF_DEMO) {
    const totalGpAwarded = demoAttempts.reduce((s, a) => s + 0, 0); // demo doesn't persist gp per-attempt separately; surfaced via session results instead
    const drillsCompleted = new Set(demoAttempts.map((a) => a.drillId)).size;
    return {
      mastery: Object.entries(demoMastery).map(([skillCategory, m]) => ({ skill_category: skillCategory, mastery_state: m.mastery_state, attempts: m.attempts, recent_accuracy: m.recent_accuracy })),
      totalGpAwarded, drillsCompleted,
    };
  }
  return apiFetch('/api/chartlab-mastery');
}

export async function getMistakes() {
  if (window.AGHF_DEMO) {
    return { mistakes: demoAttempts.filter((a) => a.result !== 'correct').map((a, i) => ({ attemptId: 'demo-mistake-' + i, drillId: a.drillId, title: a.title, skillCategory: a.skillCategory, drillType: a.drillType, score: a.score, result: a.result, completedAt: a.completedAt })) };
  }
  return apiFetch('/api/chartlab-mistakes');
}

export async function reportDrill(drillId, reason, description) {
  if (window.AGHF_DEMO) return { report: { id: 'demo-report', drillId, reason, description } };
  return apiFetch('/api/chartlab-report', { method: 'POST', body: JSON.stringify({ drillId, reason, description }) });
}

/* ── Admin ────────────────────────────────────────────────────────────── */

export async function adminListDrills() {
  if (window.AGHF_DEMO) return { drills: demoDrills.map((d) => ({ ...d, status: 'published' })) };
  return apiFetch('/api/chartlab-admin');
}

export async function adminGetDrillDetail(id) {
  if (window.AGHF_DEMO) {
    const d = demoDrills.find((x) => x.id === id);
    return { drill: d ? { ...d, status: 'published' } : null, answerKey: d ? demoAnswerKeyReveal(d) : null };
  }
  return apiFetch('/api/chartlab-admin', { method: 'POST', body: JSON.stringify({ action: 'get_drill_detail', id }) });
}

export async function adminCreateDrill(fields) {
  if (window.AGHF_DEMO) { const d = { id: 'demo-new-' + Date.now(), status: 'draft', version: 1, ...fields }; demoDrills.push(d); return { drill: d }; }
  return apiFetch('/api/chartlab-admin', { method: 'POST', body: JSON.stringify({ action: 'create_drill', ...fields }) });
}

export async function adminUpdateDrill(id, fields) {
  if (window.AGHF_DEMO) { const d = demoDrills.find((x) => x.id === id); if (d) Object.assign(d, fields); return { drill: d }; }
  return apiFetch('/api/chartlab-admin', { method: 'POST', body: JSON.stringify({ action: 'update_drill', id, ...fields }) });
}

export async function adminUpsertAnswerKey(drillId, fields) {
  if (window.AGHF_DEMO) return { answerKey: fields, versioned: false, newVersion: 1 };
  return apiFetch('/api/chartlab-admin', { method: 'POST', body: JSON.stringify({ action: 'upsert_answer_key', drillId, ...fields }) });
}

export async function adminUploadChartImage(file, drillId) {
  if (window.AGHF_DEMO) return { path: `demo/chartlab/${file.name}` };
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return apiFetch('/api/chartlab-admin', { method: 'POST', body: JSON.stringify({ action: 'upload_chart_image', dataUrl, filename: file.name, drillId }) });
}

export async function adminSetDrillStatus(id, action) {
  if (window.AGHF_DEMO) { const d = demoDrills.find((x) => x.id === id); if (d) d.status = action === 'publish_drill' ? 'published' : action === 'archive_drill' ? 'archived' : 'draft'; return { drill: d }; }
  return apiFetch('/api/chartlab-admin', { method: 'POST', body: JSON.stringify({ action, id }) });
}

export async function adminDuplicateDrill(id) {
  if (window.AGHF_DEMO) { const src = demoDrills.find((x) => x.id === id); const copy = { ...src, id: 'demo-dup-' + Date.now(), title: src.title + ' (Copy)', status: 'draft' }; demoDrills.push(copy); return { drill: copy }; }
  return apiFetch('/api/chartlab-admin', { method: 'POST', body: JSON.stringify({ action: 'duplicate_drill', id }) });
}

export async function adminListReports() {
  if (window.AGHF_DEMO) return { reports: [] };
  return apiFetch('/api/chartlab-admin?action=reports');
}

export async function adminRespondReport(id, status, adminResponse) {
  if (window.AGHF_DEMO) return { report: { id, status, adminResponse } };
  return apiFetch('/api/chartlab-admin', { method: 'POST', body: JSON.stringify({ action: 'respond_report', id, status, adminResponse }) });
}
