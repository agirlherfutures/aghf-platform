/**
 * academy-v3.js — A Girl & Her Futures™
 *
 * The Academy's lesson look: one page top, the Watch, Learn, Practice,
 * Check, Reflect bar, Aristella as the guide on every screen (her face
 * beside every answer), the lesson-complete screen, and the section home
 * on the Academy page. Turned on per phase (V3_PHASES) so phases move over
 * one at a time; styles live in academy-v3.css under body.aca-v3.
 */

import { icon } from './icons.js';

export const V3_PHASES = new Set(['p1', 'p2']);
export const isV3 = (phaseKey) => V3_PHASES.has(phaseKey);

/** Turn the look on for this page. */
export function enableV3(phaseKey) {
  document.body.classList.add('aca-v3', `aca-${phaseKey}`);
  loadArt();
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ── Aristella ─────────────────────────────────────────────────────────── */

let artPromise = null;
export function loadArt() {
  if (window.ART) return Promise.resolve(window.ART);
  if (!artPromise) {
    artPromise = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'video-intros/illustrations.js';
      s.onload = () => resolve(window.ART || null);
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
  }
  return artPromise;
}

const FACE_BOX = '85 60 230 230';

/** Aristella as an SVG string: her face (crop) or the full figure. Empty until the art has loaded. */
export function aristella(pose = 'idle', face = false) {
  if (!window.ART) return '';
  const open = face
    ? `<svg viewBox="${FACE_BOX}" width="100%" height="100%" preserveAspectRatio="xMidYMin slice" aria-hidden="true">`
    : '<svg viewBox="0 0 400 560" width="100%" height="100%" style="overflow:visible" aria-hidden="true">';
  return window.ART.aristella(1, { pose }).replace(/<svg [^>]*>/, open);
}

/** Fill every [data-ari] element under root (data-ari = pose, data-face present = face crop). */
export function paintAristella(root = document) {
  loadArt().then(() => {
    root.querySelectorAll('[data-ari]').forEach((el) => {
      if (el.dataset.painted === el.dataset.ari) return;
      el.innerHTML = aristella(el.dataset.ari, el.hasAttribute('data-face'));
      el.dataset.painted = el.dataset.ari;
    });
  });
}

/**
 * Aristella answers: every right or wrong answer anywhere in a lesson
 * (.lw-feedback, the Price Lab's .pl-fb) gets her face beside it, cheering
 * or thinking, styled as her speech bubble.
 */
export function watchFeedback(root) {
  // Chart captions already sit in Aristella's own guide bubble (guide.js), so only answers are dressed here.
  const SEL = '.lw-feedback.show, .pl-fb.show';
  const dress = () => {
    root.querySelectorAll(SEL).forEach((fb) => {
      if (fb.closest('.ag-guide')) return;
      const pose = fb.classList.contains('good') ? 'cheer' : 'think';
      let face = fb.querySelector(':scope > .v3-say-face');
      if (!face) {
        face = document.createElement('span');
        face.className = 'v3-say-face';
        face.setAttribute('data-face', '');
        fb.prepend(face);
      }
      if (face.dataset.ari !== pose) face.dataset.ari = pose;
      fb.classList.add('v3-say');
    });
    paintAristella(root);
  };
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; dress(); });
  }).observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  loadArt().then(dress);
}

/* ── Words ─────────────────────────────────────────────────────────────── */

const SMALL = new Set(['the', 'a', 'an', '&', 'vs', 'vs.', 'of', 'to', 'and', 'your', 'my']);

/** "Welcome to the Market" → "Welcome to <em>the Market</em>": the last word (and a small word before it) in italic. */
export function accent(title, tone = 'acc') {
  const words = String(title).trim().split(/\s+/);
  if (words.length < 2) return `<em class="v3-${tone}">${esc(title)}</em>`;
  const take = words.length > 2 && SMALL.has(words[words.length - 2].toLowerCase()) ? 2 : 1;
  return `${esc(words.slice(0, -take).join(' '))} <em class="v3-${tone}">${esc(words.slice(-take).join(' '))}</em>`;
}

/* ── The 5 stages of a lesson ──────────────────────────────────────────── */

export const STAGES = [
  ['watch', 'Watch'], ['learn', 'Learn'], ['practice', 'Practice'], ['check', 'Check'], ['reflect', 'Reflect'],
];
const PRACTICE = new Set(['swing_tap', 'label_swings', 'flash_sort', 'chart_tap', 'chart_direction', 'calculator', 'pnl_lab', 'instrument_explorer', 'sequence_build', 'decision_path', 'compare_cards', 'v2_tool', 'v2_missing', 'v2_ticket', 'candle_reveal']);
const CHECK = new Set(['chart_check', 'v2_scenario', 'lab_checkpoint']);
const REFLECT = new Set(['reflect', 'v2_reflect']);

/** Which stage a wizard step belongs to. */
export function stageOf(step) {
  if (step.type === 'watch') return 'watch';
  if (step.type === 'complete') return null;
  const t = step.slide?.type;
  if (REFLECT.has(t)) return 'reflect';
  if (CHECK.has(t)) return 'check';
  if (PRACTICE.has(t)) return 'practice';
  return 'learn';
}

const STAGE_SUB = {
  watch: (n, d) => (d.launchpad?.estMinutes ? `${d.launchpad.estMinutes} min video` : 'The lesson video'),
  learn: (n) => `${n} slide${n === 1 ? '' : 's'}`,
  practice: (n) => `${n} activit${n === 1 ? 'y' : 'ies'}`,
  check: (n) => `${n} question${n === 1 ? '' : 's'}`,
  reflect: () => 'One note',
};

/**
 * The stage bar. `steps` are the wizard's steps; a stage is done once
 * every step in it is done, "now" holds the current step.
 */
export function renderStageBar(el, steps, cur, done, data, onJump, canJump) {
  const used = STAGES.filter(([k]) => steps.some((s) => stageOf(s) === k));
  const curStage = stageOf(steps[cur]);
  el.innerHTML = used.map(([k, label], i) => {
    const idx = steps.map((s, j) => (stageOf(s) === k ? j : -1)).filter((j) => j >= 0);
    const isDone = idx.every((j) => done[j]) || (curStage === null);
    const state = k === curStage ? 'now' : isDone ? 'done' : '';
    const jumpable = canJump(idx[0]);
    return `<button type="button" class="v3-stage ${state}" data-jump="${idx[0]}" ${jumpable ? '' : 'disabled'} aria-current="${k === curStage ? 'step' : 'false'}">
      <i>${state === 'done' ? '✓' : i + 1}</i><span><b>${label}</b><small>${STAGE_SUB[k](idx.length, data)}</small></span></button>`;
  }).join('');
  el.style.setProperty('--n', used.length);
  el.querySelectorAll('[data-jump]').forEach((b) => b.addEventListener('click', () => onJump(Number(b.dataset.jump))));
}

/* ── Lesson page top ───────────────────────────────────────────────────── */

export function lessonHeaderHtml({ phase, section, lesson, n, total, inSection, sectionCount, minutes }) {
  return `<div class="v3-top">
      <div class="v3-top-l">
        <div class="v3-crumbs">
          <a href="lessons.html?open=${phase.key}">Phase ${phase.n} · ${esc(phase.title.replace(/\s*✦\s*$/, ''))}</a>
          <a href="lessons.html?open=${phase.key}&section=${section.key}">Section ${section.n} · ${esc(section.title)}</a>
          <span class="on">Lesson ${inSection} of ${sectionCount}</span>
        </div>
        <h1 class="v3-title" id="lhTitle">${accent(lesson.title)}</h1>
        <div class="v3-meta">
          ${minutes ? `<span class="v3-pill teal">${minutes} min</span>` : ''}
          <span class="v3-pill gold">+${lesson.xp} GP</span>
          <span class="v3-pill acc">Lesson ${n} of ${total} in Phase ${phase.n}</span>
        </div>
      </div>
      <div class="v3-top-r">
        <a class="v3-arrow" id="lhPrevLink" aria-label="Previous lesson">←</a>
        <a class="v3-arrow" id="lhNextLink" aria-label="Next lesson">→</a>
        <button type="button" class="v3-map-btn" id="lhMapToggle">☰ Academy map</button>
      </div>
    </div>
    <div class="lh-map" id="lhMap"></div>
    <div class="v3-stages" id="lhStages"></div>`;
}

/* ── Lesson complete ───────────────────────────────────────────────────── */

export function renderV3Complete(el, data, opts) {
  const { nextHref, backHref, nextTitle, nextHook, nextCtaLabel, v3 = {} } = opts;
  const takeaways = data.takeaways || [];
  const sectionLine = v3.sectionTotal ? `${Math.min(v3.sectionTotal, v3.sectionDone)} of ${v3.sectionTotal}` : '';
  el.innerHTML = `<div class="v3-done">
    <div class="v3-done-l">
      <span class="v3-kick">Lesson complete</span>
      <h1 class="v3-done-h">${esc(data.title.replace(/[?.!]$/, ''))}, <em class="v3-t">done.</em></h1>
      <div class="v3-tiles">
        ${data.xpValue ? `<div style="--c:#C9962E"><small>Earned</small><b>+${data.xpValue} GP</b></div>` : ''}
        ${sectionLine ? `<div style="--c:#3E9E93"><small>Section</small><b>${sectionLine}</b></div>` : ''}
        <div style="--c:var(--acc)"><small>Steps</small><b>All done</b></div>
      </div>
      ${takeaways.length ? `<div class="v3-learned">${takeaways.map((t) => `<div><i>✓</i><span>${esc(t)}</span></div>`).join('')}</div>` : ''}
      ${nextTitle ? `<a class="v3-next" href="${nextHref || backHref}">
        <div class="v3-next-art">${lessonDoodle(nextTitle)}</div>
        <div><span class="v3-kick">Up next</span><h3>${accent(nextTitle)}</h3>${nextHook ? `<small>${esc(nextHook)}</small>` : ''}</div></a>` : ''}
      <div class="v3-btns">
        <a class="v3-btn" href="${nextHref || backHref}">${esc(nextCtaLabel || (nextTitle ? 'Next lesson →' : 'Back to the Academy →'))}</a>
        <a class="v3-btn ghost teal" href="playbook.html">Lesson notes</a>
        <a class="v3-btn ghost" href="${backHref}">Back to section</a>
      </div>
    </div>
    <div class="v3-done-r">
      ${data.remember ? `<div class="v3-quote"><small>Remember</small><q>${esc(data.remember)}</q></div>` : ''}
      <div class="v3-done-ari" data-ari="cheer"></div>
      <svg class="v3-confetti" viewBox="0 0 400 440" aria-hidden="true">${Array.from({ length: 24 }, (_, i) => {
        const x = (i * 53) % 380 + 10; const y = (i * 37) % 300 + 130;
        return `<rect x="${x}" y="${y}" width="8" height="14" rx="2" fill="${['#F4829A', '#F5A857', '#7ECEC4', '#7F77DD'][i % 4]}" transform="rotate(${i * 29} ${x + 4} ${y + 7})" opacity=".8"/>`;
      }).join('')}</svg>
    </div>
  </div>`;
  paintAristella(el);
}

/* ── Little drawings for lesson cards ─────────────────────────────────── */

const C = (x, o, c, h, l) => {
  const up = c < o; // y grows downward
  return `<line x1="${x}" x2="${x}" y1="${h}" y2="${l}" stroke="${up ? '#3E9E93' : '#E0607C'}" stroke-width="3"/><rect x="${x - 8}" y="${Math.min(o, c)}" width="16" height="${Math.max(4, Math.abs(o - c))}" rx="3" fill="${up ? '#7ECEC4' : '#F4829A'}"/>`;
};
const pill = (x, y, t, col) => `<rect x="${x - 15}" y="${y - 9}" width="30" height="18" rx="9" fill="${col}"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-family="DM Sans" font-weight="700" font-size="10" fill="#fff">${t}</text>`;
const DOODLES = [
  [/trading|trade\b/i, `<path d="M8 58 L34 38 L50 46 L76 20 L112 10" fill="none" stroke="#3E9E93" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12 L34 30 L50 24 L76 46 L112 58" fill="none" stroke="#E0607C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>`],
  [/markets? exist|why do markets/i, `<circle cx="40" cy="36" r="20" fill="#fff" stroke="#7F77DD" stroke-width="4"/><circle cx="80" cy="36" r="20" fill="#fff" stroke="#F4829A" stroke-width="4"/><path d="M52 30h16l-5-5M68 42H52l5 5" fill="none" stroke="#2C1810" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`],
  [/buyers|sellers|aggress|control/i, C(30, 54, 22, 14, 60) + C(60, 30, 48, 24, 56) + C(90, 46, 12, 6, 52)],
  [/contract|instrument/i, `<rect x="34" y="6" width="52" height="58" rx="8" fill="#fff" stroke="#C9962E" stroke-width="4"/><path d="M45 22h30M45 34h30M45 46h18" stroke="#E2C48A" stroke-width="4" stroke-linecap="round"/>`],
  [/futures vs|stocks/i, `<rect x="14" y="14" width="40" height="44" rx="8" fill="#fff" stroke="#7F77DD" stroke-width="4"/><text x="34" y="44" text-anchor="middle" font-family="Playfair Display" font-weight="900" font-size="20" fill="#7F77DD">F</text><rect x="66" y="14" width="40" height="44" rx="8" fill="#fff" stroke="#3E9E93" stroke-width="4"/><text x="86" y="44" text-anchor="middle" font-family="Playfair Display" font-weight="900" font-size="20" fill="#3E9E93">S</text>`],
  [/p&l|points|ticks|pay|paid|money/i, `<circle cx="60" cy="35" r="26" fill="#fff" stroke="#F5A857" stroke-width="4"/><text x="60" y="45" text-anchor="middle" font-family="Playfair Display" font-weight="900" font-size="28" fill="#C4741F">$</text>`],
  [/risk|stop|protect|loss/i, `<path d="M60 6 L90 18 C90 42 78 58 60 66 C42 58 30 42 30 18 Z" fill="#FDE8ED" stroke="#E0607C" stroke-width="4"/><path d="M48 36l9 9 16-16" fill="none" stroke="#E0607C" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`],
  [/size|sizing|contracts?\b/i, `<rect x="22" y="40" width="16" height="22" rx="4" fill="#CECBF6"/><rect x="52" y="26" width="16" height="36" rx="4" fill="#7F77DD"/><rect x="82" y="10" width="16" height="52" rx="4" fill="#5E56B8"/>`],
  [/timeframe|perspective|zoom/i, `<rect x="10" y="10" width="62" height="50" rx="8" fill="#fff" stroke="#7F77DD" stroke-width="3"/><rect x="50" y="22" width="60" height="40" rx="8" fill="#fff" stroke="#F4829A" stroke-width="3"/><path d="M58 52 L72 40 L82 46 L100 30" fill="none" stroke="#3E9E93" stroke-width="3.5" stroke-linecap="round"/>`],
  [/tradingview|platform|chart basics|screen/i, `<rect x="12" y="8" width="96" height="54" rx="8" fill="#fff" stroke="#2C1810" stroke-width="3"/>${C(36, 44, 30, 22, 50)}${C(60, 32, 40, 26, 46)}${C(84, 38, 20, 14, 44)}`],
  [/wick|rejection|reject/i, `<line x1="60" y1="4" x2="60" y2="66" stroke="#E0607C" stroke-width="4"/><rect x="50" y="44" width="20" height="16" rx="3" fill="#F4829A"/><path d="M20 14h80" stroke="#C9962E" stroke-width="2.5" stroke-dasharray="6 5"/>`],
  [/close|accept|body/i, `<path d="M14 30h92" stroke="#C9962E" stroke-width="2.5" stroke-dasharray="6 5"/>${C(46, 56, 34, 30, 60)}${C(74, 36, 14, 8, 40)}`],
  [/candle|ohlc|open|high|low/i, `${C(30, 50, 26, 16, 58)}${C(60, 28, 46, 20, 54)}${C(90, 44, 14, 8, 50)}`],
  [/consolidat|range/i, `<rect x="12" y="18" width="96" height="34" rx="6" fill="#FEF3E4" stroke="#F5A857" stroke-width="2.5" stroke-dasharray="6 5"/><path d="M16 40 L30 24 L44 44 L58 24 L72 46 L86 26 L104 40" fill="none" stroke="#2C1810" stroke-width="3" stroke-linejoin="round"/>`],
  [/fake|false break/i, `<path d="M10 30h100" stroke="#C9962E" stroke-width="2.5" stroke-dasharray="6 5"/><path d="M12 56 L40 40 L58 22 L66 40 L90 52 L110 60" fill="none" stroke="#2C1810" stroke-width="3.5" stroke-linejoin="round"/><circle cx="58" cy="22" r="6" fill="#E0607C"/>`],
  [/mss|shift|reversal|invalidation|new story/i, `<path d="M10 54 L34 30 L46 40 L66 18 L80 32 L96 40 L110 62" fill="none" stroke="#2C1810" stroke-width="3.5" stroke-linejoin="round"/><path d="M50 40h66" stroke="#E0607C" stroke-width="2.5" stroke-dasharray="6 5"/>${pill(98, 22, 'MSS', '#E0607C')}`],
  [/bos|break/i, `<path d="M10 40h100" stroke="#3E9E93" stroke-width="2.5" stroke-dasharray="6 5"/><path d="M10 62 L36 34 L52 50 L80 22 L110 12" fill="none" stroke="#2C1810" stroke-width="3.5" stroke-linejoin="round"/>${pill(92, 52, 'BOS', '#3E9E93')}`],
  [/bearish|lh|lower/i, `<path d="M10 12 L34 40 L50 30 L74 56 L90 46 L110 66" fill="none" stroke="#E0607C" stroke-width="4" stroke-linejoin="round"/>${pill(50, 20, 'LH', '#F4829A')}${pill(76, 64, 'LL', '#E0607C')}`],
  [/hh|labels?|bullish|higher/i, `<path d="M10 62 L34 34 L50 44 L74 16 L90 26 L110 6" fill="none" stroke="#3E9E93" stroke-width="4" stroke-linejoin="round"/>${pill(74, 8, 'HH', '#3E9E93')}${pill(50, 56, 'HL', '#7ECEC4')}`],
  [/valid|minor/i, `<path d="M8 60 L30 30 L40 38 L46 32 L56 44 L80 14 L110 34" fill="none" stroke="#7F77DD" stroke-width="4" stroke-linejoin="round"/><circle cx="30" cy="30" r="7" fill="#7F77DD"/><circle cx="80" cy="14" r="7" fill="#7F77DD"/><circle cx="46" cy="32" r="4" fill="#fff" stroke="#C9C4F2" stroke-width="2.5"/>`],
  [/internal|external/i, `<rect x="6" y="6" width="108" height="58" rx="10" fill="none" stroke="#7F77DD" stroke-width="3" stroke-dasharray="7 5"/><path d="M18 52 L40 26 L52 38 L74 18 L86 30 L104 14" fill="none" stroke="#2C1810" stroke-width="3" stroke-linejoin="round"/><path d="M52 38 L60 30 L66 36 L74 18" fill="none" stroke="#F4829A" stroke-width="3" stroke-linejoin="round"/>`],
  [/expansion|pullback|progression/i, `<path d="M10 60 L40 22" stroke="#3E9E93" stroke-width="5" stroke-linecap="round"/><path d="M40 22 L56 40" stroke="#F4829A" stroke-width="5" stroke-linecap="round"/><path d="M56 40 L92 8" stroke="#3E9E93" stroke-width="5" stroke-linecap="round"/><path d="M92 8 L108 24" stroke="#F4829A" stroke-width="5" stroke-linecap="round"/>`],
  [/what is market structure/i, `<path d="M14 58 L30 42 L40 48 L56 30 L66 36 L84 18 L106 10" fill="none" stroke="#2C1810" stroke-width="3" stroke-linejoin="round"/>${C(30, 50, 40, 36, 54)}${C(56, 38, 28, 24, 42)}${C(84, 26, 16, 12, 30)}`],
  [/swing|structure|stairs|move|internal|external|minor|expansion|pullback|progression|continuation|retracement/i, `<path d="M10 60 L32 38 L46 48 L68 24 L82 34 L110 10" fill="none" stroke="#7F77DD" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>${[[32, 38], [46, 48], [68, 24], [82, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff" stroke="#7F77DD" stroke-width="3"/>`).join('')}`],
  [/level|support|resistance|zone|highs & lows|name/i, `<rect x="8" y="22" width="104" height="14" rx="4" fill="#E8F8F6" stroke="#3E9E93" stroke-width="2"/><path d="M12 60 L32 30 L46 50 L64 28 L84 52 L108 26" fill="none" stroke="#2C1810" stroke-width="3" stroke-linejoin="round"/>`],
  [/journal|reflect|note|plan|ready|before/i, `<rect x="30" y="6" width="60" height="58" rx="8" fill="#fff" stroke="#F4829A" stroke-width="4"/><path d="M42 22h36M42 34h36M42 46h22" stroke="#F9B8C6" stroke-width="4" stroke-linecap="round"/>`],
];
const DOODLE_BG = ['#E8F8F6', '#EEEDFE', '#FDE8ED', '#FBF5E8', '#FEF3E4'];

export function lessonDoodle(title) {
  const hit = DOODLES.find(([re]) => re.test(title));
  return `<svg viewBox="0 0 120 70" aria-hidden="true">${hit ? hit[1] : DOODLES[0][1]}</svg>`;
}
const doodleBg = (n) => DOODLE_BG[(n - 1) % DOODLE_BG.length];

/* ── Section home (Academy page, inside a phase) ──────────────────────── */

/**
 * ctx: { phase, completedIds, UNLOCK, isSectionCleared, phaseUnlocked, selected }
 * Returns html; call wirePhaseHome(container, rerender) after inserting it.
 */
export function phaseHomeHtml(ctx) {
  const { phase, completedIds, UNLOCK, isSectionCleared, phaseUnlocked } = ctx;
  const done = (l) => completedIds.has(`${phase.key}-${l.n}`);
  const built = (s) => s.lessons.filter((l) => l.n);
  const gateOk = (i) => {
    const prev = phase.sections[i - 1];
    return !prev || !prev.checkpoint || isSectionCleared(phase.key, prev.key, completedIds);
  };
  const firstOpenIdx = phase.sections.findIndex((s, i) => gateOk(i) && (built(s).some((l) => !done(l)) || (s.checkpoint && !isSectionCleared(phase.key, s.key, completedIds))));
  const selIdx = ctx.selected != null ? ctx.selected : Math.max(0, firstOpenIdx);
  const sec = phase.sections[selIdx];
  const lessons = built(sec);
  const doneCount = lessons.filter(done).length;
  const sectionOpen = UNLOCK || (phaseUnlocked && gateOk(selIdx));
  const isFirstIncomplete = (l) => !phase.sections.some((s) => s.lessons.some((x) => x.n && x.n < l.n && !done(x)));
  const stateOf = (l) => {
    if (done(l)) return 'done';
    if (UNLOCK) return isFirstIncomplete(l) ? 'now' : 'open';
    if (!sectionOpen) return 'lock';
    return isFirstIncomplete(l) ? 'now' : 'lock';
  };
  const nextLesson = lessons.find((l) => stateOf(l) === 'now') || (UNLOCK ? lessons.find((l) => !done(l)) : null);
  const allDone = lessons.length && doneCount === lessons.length;
  const cleared = isSectionCleared(phase.key, sec.key, completedIds);
  const cp = sec.checkpoint;
  const cpHref = cp ? `section.html?phase=${phase.key}&section=${sec.key}&step=${cp.firstStep || 'welcome'}` : null;
  const cpOpen = cp && (UNLOCK || (sectionOpen && allDone));
  const w = sec.welcome || { heading: sec.title, hook: '', learn: [], mission: '' };
  const pct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;
  const minsLeft = lessons.filter((l) => !done(l)).length * 6;

  let cta;
  if (nextLesson) cta = `<a class="v3-btn" href="lesson.html?phase=${phase.key}&n=${nextLesson.n}">✦ ${doneCount ? 'Continue' : 'Start'}: ${esc(nextLesson.title)}</a>`;
  else if (cpOpen && !cleared) cta = `<a class="v3-btn" href="${cpHref}">✦ Start the section challenge</a>`;
  else if (allDone) cta = `<a class="v3-btn" href="lesson.html?phase=${phase.key}&n=${lessons[0].n}">Review this section</a>`;
  else cta = '<span class="v3-btn ghost">🔒 Finish the section before this one</span>';

  const tabs = phase.sections.map((s, i) => {
    const b = built(s); const d = b.filter(done).length;
    const st = b.length && d === b.length ? 'done' : '';
    return `<button type="button" class="v3-tab ${i === selIdx ? 'on' : ''} ${st}" data-sec="${i}"><small>Section ${s.n}</small><b>${esc(s.title)}</b><span class="v3-tab-bar"><i style="width:${b.length ? Math.round((d / b.length) * 100) : 0}%"></i></span></button>`;
  }).join('');

  const cards = lessons.map((l, i) => {
    const st = stateOf(l);
    const tag = st === 'done' ? 'Done' : st === 'now' ? (doneCount ? 'Up next' : 'Start here') : st === 'open' ? `Lesson ${i + 1}` : 'Locked';
    const inner = `${st === 'now' ? '<span class="v3-here">You’re here</span>' : ''}
      <div class="v3-lart" style="background:${doodleBg(l.n)}"><span class="v3-lnum">${st === 'done' ? '✓' : st === 'lock' ? '🔒' : i + 1}</span>${lessonDoodle(l.title)}</div>
      <div class="v3-lbody"><span class="v3-kick ${st}">${tag}</span><h3>${esc(l.title)}</h3>${l.quote ? `<q>${esc(l.quote)}</q>` : ''}
        <div class="v3-meta"><span class="v3-pill gold">+${l.xp} GP</span><span class="v3-pill acc">Lesson ${l.n}</span></div></div>`;
    return st === 'lock'
      ? `<div class="v3-lcard lock">${inner}</div>`
      : `<a class="v3-lcard ${st}" href="lesson.html?phase=${phase.key}&n=${l.n}">${inner}</a>`;
  }).join('');

  const challenge = cp ? `<${cpOpen ? `a href="${cpHref}"` : 'div'} class="v3-chal ${cleared ? 'done' : cpOpen ? 'open' : ''}">
      <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#fff"/><path d="M22 16h20v10a10 10 0 0 1-20 0z" fill="#E2C48A"/><path d="M42 18h6a5 5 0 0 1-6 9M22 18h-6a5 5 0 0 0 6 9" fill="none" stroke="#C9962E" stroke-width="3"/><path d="M32 36v8M25 48h14" stroke="#C9962E" stroke-width="4" stroke-linecap="round"/></svg>
      <div class="v3-chal-t"><span class="v3-kick gold">Section challenge${cp.xp ? ` · +${cp.xp} GP` : ''}</span><h3>${accent(cp.title.replace(/\s*[👀🔎]\s*$/u, ''), 'g')}</h3><p>${esc(cp.desc || '')}</p></div>
      <span class="v3-btn ${cpOpen && !cleared ? '' : 'ghost'}">${cleared ? 'Cleared ✓' : cpOpen ? 'Start →' : `🔒 After lesson ${lessons[lessons.length - 1]?.n ?? ''}`}</span>
    </${cpOpen ? 'a' : 'div'}>` : '';

  const game = sec.game ? `<${sec.game.href && (UNLOCK || allDone) ? `a href="${sec.game.href}"` : 'div'} class="v3-chal game">
      <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#fff"/><rect x="14" y="22" width="36" height="22" rx="11" fill="#CECBF6"/><path d="M24 28v10M19 33h10" stroke="#5E56B8" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="30" r="2.5" fill="#5E56B8"/><circle cx="44" cy="36" r="2.5" fill="#5E56B8"/></svg>
      <div class="v3-chal-t"><span class="v3-kick">Game</span><h3>${esc(sec.game.title)}</h3><p>${esc(sec.game.quote || '')}</p></div>
      <span class="v3-btn ghost">${sec.game.href ? 'Play →' : 'Coming soon'}</span></${sec.game.href && (UNLOCK || allDone) ? 'a' : 'div'}>` : '';

  return `<div class="v3-phase">
    <div class="v3-tabs" role="tablist">${tabs}</div>
    <section class="v3-shero">
      <div>
        <span class="v3-eyebrow">✦ Phase ${phase.n} · Section ${sec.n} of ${phase.sections.length}</span>
        <h1>${accent(w.heading)}</h1>
        ${w.hook ? `<p>${esc(w.hook)}</p>` : ''}
        <div class="v3-prog"><div class="v3-ring" style="--p:${pct}"><b>${doneCount}/${lessons.length}</b></div>
          <div><b>${allDone ? 'Every lesson done' : `${doneCount} of ${lessons.length} lessons done`}</b><small>${allDone ? (cleared || !cp ? 'Section complete ✦' : 'One challenge to go') : `About ${minsLeft} minutes left in this section`}</small></div></div>
        <div class="v3-btns">${cta}</div>
      </div>
      <div class="v3-sart"><div class="v3-sart-ari" data-ari="wave"></div>${w.mission ? `<div class="v3-bubble"><b>Aristella</b>${esc(w.mission)}</div>` : ''}</div>
    </section>
    ${(w.learn || []).length ? `<div class="v3-learn">${w.learn.map((t) => `<div><i class="t-${t.tone || 'pink'}">${icon(t.icon, t.tone || 'pink', 22)}</i>${esc(t.label)}</div>`).join('')}</div>` : ''}
    <div class="v3-sec-h"><span class="v3-kick">Your path</span><h2>${lessons.length} lessons. <em class="v3-t">${cp ? 'One challenge.' : 'Your pace.'}</em></h2></div>
    <div class="v3-path">${cards}${challenge}${game}</div>
    ${w.goals ? `<details class="v3-goals"><summary>By the end of this section you’ll be able to…</summary><ul>${w.goals.map((g) => `<li>${esc(g)}</li>`).join('')}</ul></details>` : ''}
  </div>`;
}

export function wirePhaseHome(container, rerender) {
  container.querySelectorAll('[data-sec]').forEach((b) => b.addEventListener('click', () => rerender(Number(b.dataset.sec))));
  paintAristella(container);
}
