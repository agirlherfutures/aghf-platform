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

/** The v2 lesson-complete screen (used when data.completeStyle === 'v2'). */
export function renderV2Complete(el, data, { nextHref, backHref, nextTitle, nextCtaLabel }) {
  el.innerHTML = `
    <div class="v2 v2-full v2-done">
      <div class="v2-host-box v2-host-glow"></div>
      <div class="v2-dayli-words">
        <div class="v2-kick">Lesson complete</div>
        <div class="v2-quote">${data.doneHeading || `${data.title} ✦`}</div>
        ${data.remember ? `<p class="v2-line">${data.remember}</p>` : ''}
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
};
