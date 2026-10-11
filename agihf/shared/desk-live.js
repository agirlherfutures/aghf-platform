/**
 * desk-live.js — A Girl & Her Futures™
 *
 * The live pieces of the Dayli Desk: the MNQ and Gold "room" charts drawn
 * from real 4H and 1H swings, and the red folder news from Forex Factory.
 * Used by dashboard.html and market-outlook.html.
 *
 * Words here describe structure only. They never say buy, sell, enter or
 * target, and the ICC phase is always the member's own call.
 */

const NY = 'America/New_York';
const CALLS_KEY = 'aghf_desk_calls';
const ICC = [
  { key: 'i', letter: 'I', name: 'Indication' },
  { key: 'c1', letter: 'C', name: 'Correction' },
  { key: 'c2', letter: 'C', name: 'Continuation' },
];
const DIGITS = { mnq: 2, gc: 1 };
const PANEL_BG = { '4H': { up: '#E8F8F6', down: '#FDE8ED', range: '#FEF3E4' }, '1H': { up: '#EEEDFE', down: '#FDE8ED', range: '#FBF5E8' } };
const TREND_WORD = { up: 'UPTREND', down: 'DOWNTREND', range: 'RANGE' };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ── Data ─────────────────────────────────────────────────────────── */

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json();
}
export const getLiveMarket = () => getJson('/api/market');
export const getLiveNews = () => getJson('/api/news');

/** "YYYY-MM-DD" in New York time. */
export function nyDate(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: NY, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
const nyTime = (d) => new Intl.DateTimeFormat('en-US', { timeZone: NY, hour: 'numeric', minute: '2-digit' }).format(d);

/** Red folder (high impact) events for one New York day, soonest first. */
export function redFolderFor(events, day = nyDate(), { allCurrencies = false } = {}) {
  return (events || [])
    .filter((e) => /high/i.test(e.impact) && (allCurrencies || e.currency === 'USD'))
    .map((e) => ({ ...e, at: new Date(e.date) }))
    .filter((e) => !Number.isNaN(e.at.getTime()) && nyDate(e.at) === day)
    .sort((a, b) => a.at - b.at);
}

function untilLabel(ms) {
  if (ms <= 0) return null;
  const m = Math.round(ms / 60000);
  if (m < 60) return `in ${m}m`;
  const h = Math.floor(m / 60);
  if (h >= 24) return `in ${Math.round(h / 24)}d`;
  return `in ${h}h ${m % 60}m`;
}

/* ── The member's own ICC call, per market per day ───────────────── */

function readCalls() {
  try {
    const all = JSON.parse(localStorage.getItem(CALLS_KEY) || '{}');
    return all.date === nyDate() ? all : { date: nyDate() };
  } catch { return { date: nyDate() }; }
}
function saveCall(market, key) {
  const all = readCalls();
  if (all[market] === key) delete all[market]; else all[market] = key;
  try { localStorage.setItem(CALLS_KEY, JSON.stringify(all)); } catch { /* private window: the tap still shows until reload */ }
  return all[market] || null;
}

/* ── The room chart ───────────────────────────────────────────────── */

/**
 * Draws one timeframe the way the lessons draw it: a purple-framed room,
 * a teal line through the real swings to price now, the PIL as a gold
 * dashed line, and the trend on a dark sign.
 */
export function roomSvg(tf, frame) {
  const W = 300; const H = 200; const x0 = 34; const x1 = 266; const y0 = 42; const y1 = 164;
  const bg = PANEL_BG[tf][frame.trend] || '#FEF3E4';
  const pts = [...(frame.swings || []).slice(-6).map((s) => ({ p: s.price, tag: s.tag, type: s.type })), { p: frame.price, now: true }];
  const prices = pts.map((x) => x.p).concat(frame.pil ? [frame.pil.price] : []);
  const lo = Math.min(...prices); const hi = Math.max(...prices); const span = hi - lo || 1;
  const pad = 20;
  const y = (p) => y0 + pad + (1 - (p - lo) / span) * (y1 - y0 - pad * 2);
  const sx = (x1 - x0 - 30) / Math.max(1, pts.length - 1);
  const P = pts.map((pt, i) => ({ ...pt, x: x0 + 14 + i * sx, y: y(pt.p) }));
  const d = P.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const stripes = Array.from({ length: 8 }, (_, i) => `<rect x="${x0 + 10 + i * 29}" y="${y0}" width="13" height="${y1 - y0}" fill="#FBE9DF" opacity=".75"/>`).join('');
  const labels = P.filter((p) => p.tag).map((p) => `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#fff" stroke="#3E9E93" stroke-width="2.6"/>
    <text x="${p.x}" y="${p.type === 'high' ? p.y - 11 : p.y + 20}" text-anchor="middle" font-family="DM Sans" font-weight="700" font-size="11" fill="#3E9E93">${p.tag}</text>`).join('');
  const last = P[P.length - 1];
  const pilY = frame.pil ? y(frame.pil.price) : null;
  const pil = pilY == null ? '' : `<line x1="${x0 + 4}" x2="${x1 - 4}" y1="${pilY}" y2="${pilY}" stroke="#C9962E" stroke-width="2.4" stroke-dasharray="7 5"/>
    <rect x="${x0 + 8}" y="${pilY - 19}" width="38" height="15" rx="7.5" fill="#C9962E"/><text x="${x0 + 27}" y="${pilY - 8}" text-anchor="middle" font-family="DM Sans" font-weight="700" font-size="9.5" fill="#fff">PIL</text>`;
  const sign = `${tf} · ${TREND_WORD[frame.trend] || 'RANGE'}`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`${tf} chart: ${frame.trend}, ${frame.state}`)}">
    <rect width="${W}" height="${H}" fill="${bg}"/>
    <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#FFFBF9"/>${stripes}
    <rect x="${x0 - 6}" y="${y0 - 8}" width="${x1 - x0 + 12}" height="9" rx="4.5" fill="#7F77DD"/>
    <rect x="${x0 - 6}" y="${y1 - 1}" width="${x1 - x0 + 12}" height="9" rx="4.5" fill="#7F77DD"/>
    <rect x="${x0 - 2}" y="${y0}" width="6" height="${y1 - y0}" fill="#7F77DD"/><rect x="${x1 - 4}" y="${y0}" width="6" height="${y1 - y0}" fill="#7F77DD"/>
    ${pil}
    <path class="dz-line" pathLength="1" d="${d}" fill="none" stroke="#3E9E93" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
    ${labels}
    <circle class="dz-now" cx="${last.x}" cy="${last.y}" r="9" fill="#F4829A" opacity=".25"/><circle cx="${last.x}" cy="${last.y}" r="4.8" fill="#F4829A"/>
    <rect x="${W / 2 - 64}" y="8" width="128" height="22" rx="11" fill="#2C1810"/>
    <text x="${W / 2}" y="23" text-anchor="middle" font-family="DM Sans" font-weight="700" font-size="10.5" letter-spacing="1.3" fill="#F5C77A">${sign}</text>
    <text x="${W / 2}" y="190" text-anchor="middle" font-family="Playfair Display" font-style="italic" font-weight="700" font-size="15" fill="#2C1810">${esc(frame.state)}</text>
  </svg>`.replace(/\s{2,}/g, ' ');
}

function fmt(n, key) {
  const dg = DIGITS[key] ?? 2;
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: dg, maximumFractionDigits: dg });
}

function marketCard(m, calls) {
  const tag = m.key === 'gc' ? 'background:#FBF5E8;color:#C9962E' : 'background:#EEEDFE;color:#7F77DD';
  if (m.error) {
    return `<article class="dz-mkt"><span class="dz-tag" style="${tag}">${esc(m.symbol)} · ${esc(m.name)}</span>
      <div class="dz-mkt-off"><h3>Charts are taking a <em class="dz-p">breather.</em></h3><p>Live data for ${esc(m.name)} didn’t load. Your own chart has you covered.</p></div></article>`;
  }
  const near = m.nearestPil;
  const other = near && m[near.tf === '1H' ? 'h4' : 'h1'].pil;
  const dist = near ? Math.abs(m.price - near.price) : 0;
  const unit = m.key === 'gc' ? '' : ' pts';
  const call = calls[m.key] || null;
  const asOf = m.asOf ? `${nyTime(new Date(m.asOf * 1000))} ET` : '';
  return `<article class="dz-mkt" data-market="${esc(m.key)}">
    <div class="dz-panels"><div class="dz-panel">${roomSvg('4H', m.h4)}</div><div class="dz-panel">${roomSvg('1H', m.h1)}</div></div>
    <div class="dz-mkt-body">
      <div class="dz-mkt-top"><span class="dz-tag" style="${tag}">${esc(m.symbol)} · ${esc(m.name)}</span><span class="dz-asof">Last candle ${esc(asOf)}</span></div>
      ${near ? `<div class="dz-pil">
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="15" fill="#fff" stroke="#C9962E" stroke-width="2"/><circle cx="17" cy="17" r="9" fill="none" stroke="#F4829A" stroke-width="2"/><circle cx="17" cy="17" r="3.5" fill="#C9962E"/></svg>
        <div><span class="dz-pil-l">Nearest PIL</span> <b>${fmt(near.price, m.key)}</b>
          <small>${near.tf} swing ${near.from} · price is ${fmt(dist, m.key)}${unit} ${near.status}${other ? ` · ${near.tf === '1H' ? '4H' : '1H'} PIL ${fmt(other.price, m.key)}` : ''}</small></div>
      </div>` : ''}
      <div class="dz-icc" role="group" aria-label="Your ICC call for ${esc(m.name)}">
        <span class="dz-icc-l">Your call:</span>
        ${ICC.map((c) => `<button type="button" class="dz-dot${call === c.key ? ' on' : ''}" data-call="${c.key}" title="${c.name}" aria-pressed="${call === c.key}">${c.letter}</button>`).join('')}
        <em class="dz-icc-said">${call ? `You marked ${ICC.find((c) => c.key === call).name}` : 'Not marked yet'}</em>
      </div>
    </div>
  </article>`;
}

/** Fills `container` with both market cards (or a friendly unavailable state). */
export async function renderLiveMarkets(container) {
  container.classList.add('dz-loading');
  let data;
  try {
    data = await getLiveMarket();
  } catch (err) {
    console.error('Live market load error:', err);
    data = { markets: [{ key: 'mnq', symbol: 'MNQ', name: 'Micro Nasdaq', error: 'x' }, { key: 'gc', symbol: 'GC', name: 'Gold', error: 'x' }] };
  }
  const calls = readCalls();
  container.classList.remove('dz-loading');
  container.innerHTML = data.markets.map((m) => marketCard(m, calls)).join('');
  container.querySelectorAll('.dz-mkt[data-market]').forEach((card) => {
    card.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-call]');
      if (!btn) return;
      const picked = saveCall(card.dataset.market, btn.dataset.call);
      card.querySelectorAll('[data-call]').forEach((b) => {
        const on = b.dataset.call === picked;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      card.querySelector('.dz-icc-said').textContent = picked ? `You marked ${ICC.find((c) => c.key === picked).name}` : 'Not marked yet';
    });
  });
  return data;
}

/* ── Red folder news ──────────────────────────────────────────────── */

const FOLDER = '<svg width="46" height="38" viewBox="0 0 46 38" aria-hidden="true"><path d="M2 8a5 5 0 0 1 5-5h11l5 5h16a5 5 0 0 1 5 5v18a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5z" fill="#E86A64"/><path d="M2 15h42" stroke="#fff" stroke-opacity=".4" stroke-width="2"/></svg>';

function eventRow(e, now) {
  const left = untilLabel(e.at - now);
  const t = nyTime(e.at).split(' ');
  const detail = [e.forecast && `Forecast ${e.forecast}`, e.previous && `Previous ${e.previous}`].filter(Boolean).join(' · ') || 'No forecast';
  return `<div class="dz-ev${left ? '' : ' past'}"><div class="dz-ev-time">${esc(t[0])}<small>${esc(t[1] || '')} · ${esc(e.currency)}</small></div>${FOLDER}
    <div><h4>${esc(e.title)}</h4><p>${esc(detail)}</p></div><span class="dz-cd">${left || 'Released'}</span></div>`;
}

function handsOff(events, now) {
  const next = events.find((e) => e.at - now > -5 * 60000);
  if (!next) {
    return `<div class="dz-handsoff calm">
      <svg viewBox="0 0 140 100" aria-hidden="true"><circle cx="70" cy="52" r="38" fill="#fff"/><path d="M52 53l12 12 24-26" stroke="#3E9E93" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span class="dz-kicker" style="color:#3E9E93">All clear</span>
      <h3>No red folder <em class="dz-t">${events.length ? 'left today.' : 'today.'}</em></h3>
      <p>Still check your own calendar for anything that moves your market.</p></div>`;
  }
  const from = new Date(next.at.getTime() - 5 * 60000);
  const to = new Date(next.at.getTime() + 5 * 60000);
  const live = now >= from && now <= to;
  return `<div class="dz-handsoff${live ? ' live' : ''}">
    <svg viewBox="0 0 140 100" aria-hidden="true"><path d="M18 34a10 10 0 0 1 10-10h26l8 8h50a10 10 0 0 1 10 10v36a10 10 0 0 1-10 10H28a10 10 0 0 1-10-10z" fill="#E86A64"/><path d="M18 46h104" stroke="#fff" stroke-opacity=".35" stroke-width="2"/><circle cx="108" cy="24" r="15" fill="#fff" stroke="#F5A857" stroke-width="3"/><path d="M108 16v8l5 4" stroke="#2C1810" stroke-width="2.6" stroke-linecap="round" fill="none"/><text x="70" y="70" text-anchor="middle" font-family="Playfair Display" font-weight="900" font-size="15" fill="#fff">${esc(nyTime(next.at).replace(/ [AP]M/, ''))}</text></svg>
    <span class="dz-kicker" style="color:#C4741F">${live ? 'Hands off now' : 'Hands-off window'}</span>
    <h3>Flat before <em class="dz-p">the number.</em></h3>
    <p>No new trades around ${esc(next.title)}. Let the candle print, then read the room again.</p>
    <span class="dz-win">${esc(nyTime(from))} to ${esc(nyTime(to))}</span></div>`;
}

/**
 * Fills the hands-off card and the event list, refreshing the countdowns
 * every 30 seconds. Returns today's USD red folder events.
 */
export async function renderRedFolder(handsOffEl, listEl, { allToggle = null } = {}) {
  let events;
  try {
    events = (await getLiveNews()).events;
  } catch (err) {
    console.error('News load error:', err);
    handsOffEl.innerHTML = '';
    handsOffEl.closest('.dz-news')?.classList.add('dz-news-off');
    if (allToggle) allToggle.hidden = true;
    listEl.innerHTML = `<div class="dz-ev-off"><h4>The calendar didn’t load.</h4><p>Check <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener">Forex Factory</a> directly before you trade.</p></div>`;
    return null;
  }
  let all = false;
  const draw = () => {
    const now = new Date();
    const usd = redFolderFor(events);
    const shown = all ? redFolderFor(events, nyDate(), { allCurrencies: true }) : usd;
    handsOffEl.innerHTML = handsOff(usd, now);
    listEl.innerHTML = shown.length
      ? shown.map((e) => eventRow(e, now)).join('')
      : `<div class="dz-ev-off"><h4>No ${all ? '' : 'USD '}red folder news today.</h4><p>A quieter calendar. Your plan still decides.</p></div>`;
  };
  draw();
  if (allToggle) {
    allToggle.addEventListener('click', () => {
      all = !all;
      allToggle.textContent = all ? 'USD only' : 'All currencies';
      draw();
    });
  }
  setInterval(draw, 30000);
  return redFolderFor(events);
}

/** The whole week's USD red folder events, grouped by New York day. */
export async function renderRedFolderWeek(container) {
  let events;
  try {
    events = (await getLiveNews()).events;
  } catch (err) {
    console.error('News load error:', err);
    container.innerHTML = '<div class="dz-ev-off"><h4>The calendar didn’t load.</h4><p>Check <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener">Forex Factory</a> directly before you trade.</p></div>';
    return;
  }
  const now = new Date();
  const days = [...new Set(events.map((e) => new Date(e.date)).filter((d) => !Number.isNaN(d.getTime())).map((d) => nyDate(d)))].sort();
  const today = nyDate();
  const html = days.map((day) => {
    const list = redFolderFor(events, day);
    if (!list.length) return '';
    const label = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'short', day: 'numeric' }).format(new Date(`${day}T12:00:00Z`));
    return `<h3 class="dz-day">${esc(label)}${day === today ? ' <em class="dz-p">today</em>' : ''}</h3><div class="dz-events">${list.map((e) => eventRow(e, now)).join('')}</div>`;
  }).join('');
  container.innerHTML = html || '<div class="dz-ev-off"><h4>No USD red folder news this week.</h4><p>A quieter calendar. Your plan still decides.</p></div>';
}
