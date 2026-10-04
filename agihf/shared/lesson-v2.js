/**
 * lesson-v2.js — A Girl & Her Futures™
 *
 * The redesigned lesson screens: one idea per screen, a big headline, at
 * most one short line, and a visual that teaches. On desktop each screen
 * splits into words (left) and visual (right); on phones they stack.
 * Aristella, the host from the lesson videos, appears on the opening
 * screen, delivers Dayli Says and celebrates at the end.
 *
 *   v2_hero      headline + line + Aristella
 *   v2_tiles     big Long / Short tiles + a quick check
 *   v2_ticket    a trade ticket she fills in, one tap per line
 *   v2_missing   the same ticket with gaps: tap what's missing
 *   v2_compare   two drawn cards side by side + a quick check
 *   v2_scenario  a small drawn chart + a quick check
 *   v2_dayli     Aristella delivers Dayli Says
 *   v2_reflect   one short typed answer, then Dayli's answer
 *
 * Every renderer has the slide-engine signature (el, slide, satisfy, helpers).
 * A lesson opts into the matching complete screen with "completeStyle": "v2".
 */

import { wireRetryOptions } from './lesson-engine.js';
import { saveLessonReflection } from './journal-service.js';

/* ── Aristella (the same drawing as the videos) ───────────────────────── */

let artLoading = null;
function loadArt() {
  if (window.ART) return Promise.resolve(window.ART);
  if (!artLoading) {
    artLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'video-intros/illustrations.js';
      s.onload = () => resolve(window.ART);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return artLoading;
}

const still = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Draw Aristella into `box` and keep her gently alive (blink, bob) while on screen. */
export function mountHost(box, pose = 'idle') {
  box.classList.add('v2-host');
  loadArt().then((ART) => {
    if (!ART) return;
    const draw = (t) => {
      box.innerHTML = ART.aristella(t, { pose }).replace(/<svg [^>]*>/, '<svg viewBox="0 0 400 560" width="100%" height="100%" style="overflow:visible" aria-hidden="true">');
    };
    if (still()) { draw(1); return; }
    const t0 = performance.now();
    let last = 0;
    const tick = (now) => {
      if (!box.isConnected) return;
      if (now - last > 33) { draw((now - t0) / 1000); last = now; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }).catch(() => box.remove());
}

/* ── Shared pieces ─────────────────────────────────────────────────────── */

const ICONS = {
  market: '<svg width="22" height="22" viewBox="0 0 20 20"><rect x="2" y="9" width="3" height="8" rx="1" fill="#7F77DD"/><rect x="8.5" y="4" width="3" height="13" rx="1" fill="#7F77DD"/><rect x="15" y="7" width="3" height="10" rx="1" fill="#7F77DD"/></svg>',
  direction: '<svg width="22" height="22" viewBox="0 0 20 20"><path d="M3 15 L10 5 L17 15" fill="none" stroke="#2F8A7F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  risk: '<svg width="22" height="22" viewBox="0 0 20 20"><path d="M10 2 L17 5 C17 12 14 16 10 18 C6 16 3 12 3 5 Z" fill="#F4829A"/></svg>',
  outcome: '<svg width="22" height="22" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="#F5A857"/><text x="10" y="14" font-size="10" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans, sans-serif">$</text></svg>',
};
const ICON_BG = { market: 'var(--v2-purpleP)', direction: 'var(--v2-tealP)', risk: 'var(--v2-pinkP)', outcome: 'var(--v2-peachP)' };

const SPARKS = {
  up: '<polyline points="4,62 30,44 46,52 76,22 92,30 116,6" />',
  down: '<polyline points="4,8 30,26 46,18 76,48 92,40 116,64" />',
  slow: '<polyline points="4,52 20,48 36,44 52,40 68,34 84,28 100,22 116,14" />',
  chop: '<polyline points="4,40 18,26 28,34 44,14 56,30 70,20 84,44 98,28 116,10" />',
};

/** The screen shell: words on the left, the visual on the right. */
function shell(el, slide, rightHtml, extraLeft = '', opts = {}) {
  el.innerHTML = `
    <div class="v2${opts.cls ? ` ${opts.cls}` : ''}">
      <div class="v2-l">
        ${slide.kicker ? `<div class="v2-kick">${slide.kicker}</div>` : ''}
        ${slide.headline ? `<h2 class="v2-big${slide.small ? ' v2-big-sm' : ''}">${slide.headline}</h2>` : ''}
        ${slide.line ? `<p class="v2-line">${slide.line}</p>` : ''}
        ${extraLeft}
        <div class="v2-spacer"></div>
        <div class="v2-act"></div>
      </div>
      <div class="v2-r">${rightHtml}</div>
    </div>`;
  return { card: el.querySelector('.v2'), act: el.querySelector('.v2-act'), right: el.querySelector('.v2-r') };
}

function nextBtn(act, satisfy, label = 'Next →', pink = false) {
  if (act.querySelector('.v2-btn')) return;
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `v2-btn${pink ? ' v2-btn-pink' : ''} v2-pop`;
  b.textContent = label;
  b.addEventListener('click', satisfy);
  act.appendChild(b);
}

/** A tap question; `onSolved` runs once the right option is picked. */
function check(container, chk, helpers, onSolved) {
  const box = document.createElement('div');
  box.className = 'v2-check';
  box.innerHTML = `${chk.prompt ? `<div class="v2-q">${chk.prompt}</div>` : ''}
    <div class="v2-chips${chk.stack || chk.options.some((o) => o.label.length > 14) ? ' v2-chips-col' : ''}">
      ${chk.options.map((o, i) => `<button type="button" class="v2-chip" data-i="${i}">${o.label}</button>`).join('')}
    </div><div class="lw-feedback"></div>`;
  container.appendChild(box);
  wireRetryOptions(box.querySelectorAll('.v2-chip'), chk.options, box.querySelector('.lw-feedback'), onSolved, helpers.handleStreak);
}

/* ── Screens ───────────────────────────────────────────────────────────── */

export function renderV2Hero(el, slide, satisfy) {
  const { act, right } = shell(el, slide, '<div class="v2-host-box"></div>', '', { cls: 'v2-hero' });
  mountHost(right.querySelector('.v2-host-box'), slide.pose || 'wave');
  nextBtn(act, satisfy, slide.cta || 'Let’s go →', true);
}

export function renderV2Tiles(el, slide, satisfy, helpers) {
  const tiles = slide.tiles.map((t) => `
    <button type="button" class="v2-tile v2-tile-${t.dir}">
      <svg viewBox="0 0 120 70" class="v2-spark">${SPARKS[t.dir]}</svg>
      <span class="v2-tile-name">${t.label}</span><span class="v2-tile-sub">${t.sub}</span>
    </button>`).join('');
  const { act } = shell(el, slide, `<div class="v2-tiles">${tiles}</div>`, '<div class="v2-check-slot"></div>');
  el.querySelectorAll('.v2-tile').forEach((t) => t.addEventListener('click', () => {
    t.classList.remove('v2-tile-on'); void t.offsetWidth; t.classList.add('v2-tile-on');
  }));
  check(el.querySelector('.v2-check-slot'), slide.check, helpers, () => nextBtn(act, satisfy));
}

function ticketRow(r, state) {
  const missing = state === 'missing' || state === 'gap';
  return `<button type="button" class="v2-row v2-row-${state}" data-key="${r.key}">
      <span class="v2-ico" style="background:${missing ? '#F6EDE6' : ICON_BG[r.key]}">${missing ? '' : ICONS[r.key]}</span>
      <span class="v2-row-txt"><span class="v2-k">${r.label}</span><span class="v2-v">${state === 'hidden' ? 'Tap to fill in' : missing ? '?' : r.value}</span></span>
      ${state === 'missing' ? '<span class="v2-tag v2-tag-no">missing</span>' : state === 'have' ? '<span class="v2-tag v2-tag-ok">✓</span>' : ''}
    </button>`;
}

export function renderV2Ticket(el, slide, satisfy) {
  const { act, right } = shell(el, slide, `<div class="v2-ticket">${slide.rows.map((r) => ticketRow(r, 'hidden')).join('')}</div>`);
  const filled = new Set();
  right.querySelectorAll('.v2-row').forEach((btn, i) => btn.addEventListener('click', () => {
    if (filled.has(i)) return;
    filled.add(i);
    btn.outerHTML = ticketRow(slide.rows[i], 'filled').replace('class="v2-row ', 'class="v2-row v2-pop ');
    if (filled.size === slide.rows.length) nextBtn(act, satisfy);
  }));
}

export function renderV2Missing(el, slide, satisfy, helpers) {
  const { act, right } = shell(el, slide, `<div class="v2-ticket">${slide.rows.map((r) => ticketRow(r, r.present ? 'have' : 'gap')).join('')}</div>`, '<div class="lw-feedback v2-fb"></div>');
  const fb = el.querySelector('.v2-fb');
  const need = slide.rows.filter((r) => !r.present).length;
  const found = new Set();
  right.querySelectorAll('.v2-row').forEach((btn, i) => btn.addEventListener('click', () => {
    const r = slide.rows[i];
    if (r.present) {
      fb.innerHTML = slide.presentNote || `${r.label.charAt(0) + r.label.slice(1).toLowerCase()} is there. Look for what’s missing.`;
      fb.className = 'lw-feedback v2-fb show bad';
      helpers.handleStreak(false);
      return;
    }
    if (found.has(i)) return;
    found.add(i);
    helpers.handleStreak(true);
    right.querySelectorAll('.v2-row')[i].outerHTML = ticketRow(r, 'missing').replace('class="v2-row ', 'class="v2-row v2-pop ');
    // Re-wire is unnecessary: a found row only needs to stay marked.
    if (found.size === need) {
      fb.innerHTML = `<strong>✦</strong> ${slide.why}`;
      fb.className = 'lw-feedback v2-fb show good';
      nextBtn(act, satisfy);
    } else {
      fb.innerHTML = `Yes. ${need - found.size} more.`;
      fb.className = 'lw-feedback v2-fb show good';
    }
  }));
}

export function renderV2Compare(el, slide, satisfy, helpers) {
  const cards = slide.cards.map((c) => `
    <div class="v2-card v2-card-${c.tone || 'purple'}">
      ${c.tag ? `<span class="v2-card-tag">${c.tag}</span>` : ''}
      <svg viewBox="0 0 120 70" class="v2-spark">${SPARKS[c.spark]}</svg>
      <b>${c.label}</b><span>${c.sub}</span>
    </div>`).join('');
  const { act } = shell(el, slide, `<div class="v2-cards">${cards}</div>`, '<div class="v2-check-slot"></div>');
  check(el.querySelector('.v2-check-slot'), slide.check, helpers, () => nextBtn(act, satisfy));
}

const SCENES = {
  // A long trade that falls to its stop: the plan says you're wrong.
  stopped_long: `<svg viewBox="0 0 300 160" class="v2-scene" role="img" aria-label="Price falls from the entry down to the stop">
      <line x1="10" x2="290" y1="58" y2="58" stroke="#7F77DD" stroke-width="2" stroke-dasharray="6 5"/>
      <text x="288" y="50" font-size="11" font-weight="800" text-anchor="end" fill="#5E56B8">YOUR ENTRY (LONG)</text>
      <line x1="10" x2="290" y1="116" y2="116" stroke="#F4829A" stroke-width="3"/>
      <text x="236" y="136" font-size="11" font-weight="800" text-anchor="end" fill="#C2475F">YOUR STOP · IDEA IS WRONG</text>
      <polyline class="v2-draw" points="14,70 50,52 80,62 110,46 140,58 165,76 190,70 215,92 240,104 262,120" fill="none" stroke="#2C1810" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="110" cy="58" r="6" fill="#7F77DD"/>
      <circle class="v2-late" cx="262" cy="118" r="7" fill="#F4829A" stroke="#fff" stroke-width="2"/>
    </svg>`,
};

export function renderV2Scenario(el, slide, satisfy, helpers) {
  const { act } = shell(el, slide, `<div class="v2-scene-box">${SCENES[slide.scene] || ''}</div>`, '<div class="v2-check-slot"></div>');
  check(el.querySelector('.v2-check-slot'), slide.check, helpers, () => nextBtn(act, satisfy));
}

export function renderV2Dayli(el, slide, satisfy) {
  el.innerHTML = `
    <div class="v2 v2-full v2-dayli">
      <div class="v2-host-box"></div>
      <div class="v2-dayli-words">
        <div class="v2-kick">${slide.kicker || 'Dayli says'}</div>
        <div class="v2-quote">${slide.quote}</div>
        ${slide.line ? `<p class="v2-line">${slide.line}</p>` : ''}
        <div class="v2-act"></div>
      </div>
    </div>`;
  mountHost(el.querySelector('.v2-host-box'), slide.pose || 'point');
  nextBtn(el.querySelector('.v2-act'), satisfy, slide.cta || 'Got it ✦', true);
}

export function renderV2Reflect(el, slide, satisfy, helpers) {
  const { act, right } = shell(el, { ...slide, headline: slide.prompt, small: true, line: slide.hint || 'One or two sentences is perfect. It saves to your Lesson Notes.' },
    `<div class="v2-write"><textarea class="v2-textarea" rows="5" placeholder="Type it how YOU understand it…"></textarea>
      <div class="v2-answer" hidden><strong>💡 Dayli’s answer:</strong> ${slide.modelAnswer}</div></div>`);
  const input = right.querySelector('textarea');
  const save = document.createElement('button');
  save.type = 'button';
  save.className = 'v2-btn v2-btn-pink';
  save.textContent = 'Save my answer →';
  save.disabled = true;
  act.appendChild(save);
  input.addEventListener('input', () => { save.disabled = input.value.trim().length < 8; });
  save.addEventListener('click', () => {
    const text = input.value.trim();
    try {
      const notes = JSON.parse(localStorage.getItem('aghf_notes') || '[]');
      notes.push({ lessonId: helpers.lessonId, prompt: slide.prompt, text, savedAt: Date.now() });
      localStorage.setItem('aghf_notes', JSON.stringify(notes));
    } catch (err) { console.error('Note save error:', err); }
    saveLessonReflection(helpers.lessonId, slide.prompt, text).catch((err) => console.error('Server reflection save error:', err));
    input.disabled = true;
    right.querySelector('.v2-answer').hidden = false;
    save.remove();
    nextBtn(act, satisfy, slide.cta || 'Finish lesson →', true);
  });
}


/* ── Drawn icons (no emoji): 24×24, two-tone ───────────────────────────── */

const IC = {
  up: '<path d="M4 17 L10 11 L13 14 L20 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 7 H20 V12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  down: '<path d="M4 7 L10 13 L13 10 L20 17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 17 H20 V12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  clock: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 7 V12 L15.5 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  shield: '<path d="M12 3 L19 6 C19 13 16 18 12 21 C8 18 5 13 5 6 Z" fill="currentColor" opacity=".9"/>',
  coin: '<circle cx="12" cy="12" r="8.5" fill="currentColor"/><text x="12" y="16.2" font-size="11" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans, sans-serif">$</text>',
  bars: '<rect x="4" y="11" width="3.4" height="9" rx="1" fill="currentColor"/><rect x="10.3" y="5" width="3.4" height="15" rx="1" fill="currentColor"/><rect x="16.6" y="8" width="3.4" height="12" rx="1" fill="currentColor"/>',
  target: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>',
  layers: '<path d="M12 4 L21 9 L12 14 L3 9 Z" fill="currentColor"/><path d="M3 13 L12 18 L21 13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
  globe: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M3.5 12 H20.5 M12 3.5 C8 8 8 16 12 20.5 C16 16 16 8 12 3.5" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  scale: '<path d="M12 4 V20 M6 20 H18 M5 8 H19" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M5 8 L2.5 14 H7.5 Z M19 8 L16.5 14 H21.5 Z" fill="currentColor"/>',
  bolt: '<path d="M13 2 L5 13 H11 L10 22 L19 10 H13 Z" fill="currentColor"/>',
  swap: '<path d="M4 8 H18 M14 4 L18 8 L14 12 M20 16 H6 M10 12 L6 16 L10 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  user: '<circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 20 C5 15 8.5 13 12 13 C15.5 13 19 15 20 20 Z" fill="currentColor"/>',
  bank: '<path d="M3 9 L12 4 L21 9 Z" fill="currentColor"/><path d="M5 10 V17 M9.5 10 V17 M14.5 10 V17 M19 10 V17 M3 19 H21" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  flask: '<path d="M9 3 H15 M10 3 V9 L4.5 18.5 C4 19.5 4.6 21 6 21 H18 C19.4 21 20 19.5 19.5 18.5 L14 9 V3" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><path d="M7 16 H17 L18.5 19 H5.5 Z" fill="currentColor"/>',
  flag: '<path d="M5 21 V4" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/><path d="M5 4 H18 L15.5 8 L18 12 H5 Z" fill="currentColor"/>',
  eye: '<path d="M2 12 C5 6.5 8.5 4.5 12 4.5 C15.5 4.5 19 6.5 22 12 C19 17.5 15.5 19.5 12 19.5 C8.5 19.5 5 17.5 2 12 Z" fill="none" stroke="currentColor" stroke-width="2.1"/><circle cx="12" cy="12" r="3.4" fill="currentColor"/>',
  zoom: '<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="M15.5 15.5 L20.5 20.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  candle: '<path d="M12 2.5 V21.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="8" y="7" width="8" height="10" rx="1.5" fill="currentColor"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M3.5 10 H20.5 M8 3 V7 M16 3 V7" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="currentColor"/><path d="M8 10.5 V7.5 C8 5 10 3.5 12 3.5 C14 3.5 16 5 16 7.5 V10.5" fill="none" stroke="currentColor" stroke-width="2.2"/>',
  stop: '<path d="M8 3 H16 L21 8 V16 L16 21 H8 L3 16 V8 Z" fill="currentColor"/><path d="M8 12 H16" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>',
  check: '<circle cx="12" cy="12" r="9" fill="currentColor"/><path d="M7.5 12.5 L10.5 15.5 L16.5 9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  layout: '<rect x="3" y="4" width="18" height="16" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M3 9 H21 M9 9 V20" stroke="currentColor" stroke-width="2.1"/>',
  ruler: '<rect x="2.5" y="8" width="19" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M6.5 8 V11.5 M10.5 8 V12.5 M14.5 8 V11.5 M18.5 8 V12.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  heart: '<path d="M12 20 C5 15 3 11.5 3 8.5 C3 6 5 4 7.5 4 C9.5 4 11 5 12 6.8 C13 5 14.5 4 16.5 4 C19 4 21 6 21 8.5 C21 11.5 19 15 12 20 Z" fill="currentColor"/>',
  doc: '<path d="M6 3 H14 L19 8 V21 H6 Z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><path d="M9 12 H16 M9 16 H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
};
const TONES = { pink: ['#F4829A', '#FDE8ED'], teal: ['#2F8A7F', '#E8F8F6'], purple: ['#7F77DD', '#EEEDFE'], peach: ['#E08E2E', '#FEF3E4'], dark: ['#2C1810', '#F6EDE6'] };
function icon(name, tone = 'pink', size = 26) {
  const [fg, bg] = TONES[tone] || TONES.pink;
  return `<span class="v2-icon" style="background:${bg};color:${fg};width:${size * 1.9}px;height:${size * 1.9}px"><svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${IC[name] || IC.check}</svg></span>`;
}

/* ── v2_screen: the general screen. A headline, one line, one visual, an optional quick check.
 *   visual: { host: pose }
 *         | { icon, tone, caption }
 *         | { cards: [{ icon, tone, label, sub }], tapAll }   tap each card to reveal its line
 *         | { versus: [{ label, tone, icon, points: [] }, …] }
 *         | { chart: <structure-charts spec>, steps: [{ show, text }] }
 *         | { scene }
 *   check: { prompt, options, stack } (same option shape as everywhere else)
 */
let mountChartFn = null;
async function chartLib() {
  if (!mountChartFn) ({ mountChart: mountChartFn } = await import('./structure-charts.js'));
  return mountChartFn;
}

export function renderV2Screen(el, slide, satisfy, helpers) {
  const v = slide.visual || {};
  let right = '';
  if (v.host) right = '<div class="v2-host-box"></div>';
  else if (v.icon) right = `<div class="v2-bigicon">${icon(v.icon, v.tone, 56)}${v.caption ? `<div class="v2-bigicon-cap">${v.caption}</div>` : ''}</div>`;
  else if (v.cards) right = `<div class="v2-tapcards v2-tapcards-${v.cards.length}">${v.cards.map((c, i) => `
      <button type="button" class="v2-tapcard${v.tapAll === false ? ' open' : ''}" data-i="${i}">
        ${icon(c.icon, c.tone, 22)}<span class="v2-tapcard-label">${c.label}</span><span class="v2-tapcard-sub">${c.sub}</span>
        <span class="v2-tapcard-hint">Tap</span>
      </button>`).join('')}</div>`;
  else if (v.versus) right = `<div class="v2-versus">${v.versus.map((c) => `
      <div class="v2-vs v2-vs-${c.tone || 'purple'}">${c.icon ? icon(c.icon, c.tone, 20) : ''}<b>${c.label}</b>
        <ul>${c.points.map((pt) => `<li>${pt}</li>`).join('')}</ul></div>`).join('<div class="v2-vs-ne">≠</div>')}</div>`;
  else if (v.chart) right = `<div class="v2-chartbox"><div class="v2-chart"></div>${v.steps ? '<div class="v2-chart-cap"></div><button type="button" class="v2-stepbtn">Show me →</button>' : ''}</div>`;
  else if (v.scene) right = `<div class="v2-scene-box">${SCENES[v.scene] || ''}</div>`;

  const { act, card } = shell(el, slide, right, slide.check ? '<div class="v2-check-slot"></div>' : '', { cls: right ? '' : 'v2-solo' });
  const gates = [];
  const ready = () => { if (gates.every((g) => g.done)) nextBtn(act, satisfy, slide.cta || 'Next →', !!slide.ctaPink); };

  if (v.host) mountHost(card.querySelector('.v2-host-box'), v.host);
  if (v.cards) {
    const btns = [...card.querySelectorAll('.v2-tapcard')];
    const g = { done: v.tapAll === false };
    gates.push(g);
    const seen = new Set();
    btns.forEach((b, i) => b.addEventListener('click', () => {
      b.classList.add('open', 'v2-pop');
      seen.add(i);
      if (!g.done && seen.size === btns.length) { g.done = true; ready(); }
    }));
  }
  if (v.chart) {
    const g = { done: !v.steps };
    gates.push(g);
    chartLib().then((mount) => {
      const chart = mount(card.querySelector('.v2-chart'), v.chart, { label: slide.headline });
      if (!v.steps) return;
      const cap = card.querySelector('.v2-chart-cap');
      const btn = card.querySelector('.v2-stepbtn');
      let k = 0;
      btn.addEventListener('click', () => {
        const st = v.steps[k];
        chart.reveal(st.show);
        if (st.hide) chart.hide(st.hide);
        cap.innerHTML = st.text || '';
        cap.classList.remove('v2-pop'); void cap.offsetWidth; cap.classList.add('v2-pop');
        k += 1;
        if (k >= v.steps.length) { btn.remove(); g.done = true; ready(); } else btn.textContent = st.next || 'Next →';
      });
    });
  }
  if (slide.check) {
    const g = { done: false };
    gates.push(g);
    check(card.querySelector('.v2-check-slot'), slide.check, helpers, () => { g.done = true; ready(); });
  }
  ready();
}

/* ── v2_tool: one of the existing interactive tools (calculator, explorer,
 * chart tap, candle reveal, decision path…) under a v2 header. The tool keeps
 * its own logic and its own Continue button. */
export function renderV2Tool(el, slide, satisfy, helpers) {
  el.innerHTML = `
    <div class="v2 v2-toolwrap">
      <div class="v2-toolhead">
        ${slide.kicker ? `<div class="v2-kick">${slide.kicker}</div>` : ''}
        ${slide.headline ? `<h2 class="v2-big v2-big-sm">${slide.headline}</h2>` : ''}
        ${slide.line ? `<p class="v2-line">${slide.line}</p>` : ''}
      </div>
      <div class="v2-toolbody"></div>
    </div>`;
  const body = el.querySelector('.v2-toolbody');
  import('./lesson-slides-engine.js').then(({ SLIDE_RENDERERS }) => {
    const r = SLIDE_RENDERERS[slide.tool.type];
    if (r) r(body, slide.tool, satisfy, helpers); else satisfy();
  });
}

/** The v2 lesson-complete screen (used when data.completeStyle === 'v2'). */
export function renderV2Complete(el, data, { nextHref, backHref, nextTitle, nextCtaLabel }) {
  el.innerHTML = `
    <div class="v2 v2-full v2-done">
      <div class="v2-host-box v2-host-glow"></div>
      <div class="v2-dayli-words">
        <div class="v2-kick">Lesson complete</div>
        <div class="v2-quote">${data.doneHeading || `${data.title} ✦`}</div>
        ${data.remember ? `<p class="v2-line">${data.remember}</p>` : ''}
        ${(data.takeaways || []).length ? `<ul class="v2-takeaways">${data.takeaways.map((t) => `<li>${t}</li>`).join('')}</ul>` : ''}
        <div class="v2-gp">+${data.xpValue} GP</div>
        <div class="v2-act"><button type="button" class="v2-btn v2-btn-pink" id="v2NextBtn">${nextTitle ? `Next: ${nextTitle} →` : (nextCtaLabel || 'Back to lessons →')}</button></div>
      </div>
    </div>
    <div class="lw-back-link"><a href="${backHref}">← Back to all lessons</a></div>`;
  mountHost(el.querySelector('.v2-host-box'), 'cheer');
  el.querySelector('#v2NextBtn').addEventListener('click', () => { window.location.href = nextHref || backHref; });
}

export const V2_RENDERERS = {
  v2_hero: renderV2Hero,
  v2_tiles: renderV2Tiles,
  v2_ticket: renderV2Ticket,
  v2_missing: renderV2Missing,
  v2_compare: renderV2Compare,
  v2_scenario: renderV2Scenario,
  v2_dayli: renderV2Dayli,
  v2_reflect: renderV2Reflect,
  v2_screen: renderV2Screen,
  v2_tool: renderV2Tool,
};
