/**
 * phase-final.js — A Girl & Her Futures™
 *
 * The end of a phase: the Phase Final (a mastery gate across every section
 * of the phase), the mastery profile built from real tracked answers, badges,
 * and the phase completion screen. Used by section-engine.js steps
 * 'final' and 'phase-complete'.
 *
 *   final = {
 *     title, intro, passPct, questionCount,
 *     mix: { visual: 9, mcq: 6, written: 1 },     how many of each to draw
 *     bank: [
 *       { kind: 'mcq', skill, prompt, hint, options: [{ label, correct, why, feedback }] },
 *       { kind: 'slide', skill, slide: { …any lesson slide type… } },
 *       { kind: 'written', prompt, model, min },   ungraded: a model answer follows
 *     ],
 *   }
 *
 * An item counts as correct only when every decision in it was right the
 * first time (any wrong pick marks it wrong). Written reasoning isn't scored.
 * Results are stored per skill in `aghf_concepts:<phase>-final`.
 */

import { SLIDE_RENDERERS } from './lesson-slides-engine.js';
import { askQuestion } from './price-lab.js';

/* ── Skills: what the mastery profile reports, and where to review ─── */

// Each skill gathers every concept key that measures it: Knowledge Check /
// game labels (aghf_concepts:*), lesson tags (aghf_learning) and Final items.
export const PHASE2_SKILLS = [
  { key: 'swings', label: 'Swing identification', review: ['p2', 2], keys: ['Swing highs & lows', 'Relevant swings', 'relevant-swing'] },
  { key: 'labels', label: 'HH / HL / LH / LL', phrase: 'HH / HL / LH / LL labels', review: ['p2', 3], keys: ['HH / HL / LH / LL'] },
  { key: 'trend', label: 'Bullish & bearish structure', review: ['p2', 4], keys: ['Bullish & bearish structure', 'Reading structure', 'Trend vs. range', 'Candle color vs. structure'] },
  { key: 'intext', label: 'Internal vs. external', review: ['p2', 7], keys: ['Internal vs. external', 'internal-structure', 'external-structure'], nudge: 'Minor internal breaks are still tripping you up.' },
  { key: 'bosmss', label: 'BOS / MSS', review: ['p2', 12], keys: ['BOS', 'MSS', 'bos', 'mss', 'What actually broke', 'structural-break'] },
  { key: 'contrev', label: 'Retracement vs. reversal', review: ['p2', 14], keys: ['Continuation vs. reversal', 'Retracement vs. reversal', 'Pullbacks vs. reversals', 'continuation', 'reversal', 'retracement'] },
  { key: 'wick', label: 'Wick vs. close', review: ['p2', 15], keys: ['Wick vs. close', 'wick-break', 'close-break'] },
  { key: 'fakes', label: 'False breaks', review: ['p2', 16], keys: ['False breaks', 'false-break', 'objective-observation'] },
  { key: 'invalid', label: 'Structural invalidation', review: ['p2', 17], keys: ['Structural invalidation', 'structural-invalidation'] },
  { key: 'accrej', label: 'Acceptance / rejection', review: ['p2', 20], keys: ['Acceptance vs. rejection', 'acceptance-rejection'] },
  { key: 'levels', label: 'Level selection', review: ['p2', 23], keys: ['Support & resistance', 'Zones vs. lines', 'Level quality', 'Previous highs & lows', 'Structure-based levels', 'Chart cleanup', 'Context > label',
    'support-resistance', 'level-expectations', 'zones-lines', 'level-quality', 'previous-levels', 'structure-levels', 'chart-cleanup', 'context-label'] },
];

// Repeated mistake types worth calling out by name.
const MISTAKE_INSIGHTS = {
  'internal-as-mss': { skill: 'intext', text: 'You correctly identify BOS, but you’re sometimes treating minor internal breaks as larger structural shifts.', review: ['p2', 12], label: 'Market Structure Shift' },
  'internal-as-bos': { skill: 'intext', text: 'Tiny internal breaks are sometimes reading as a larger BOS for you.', review: ['p2', 11], label: 'Break of Structure' },
  'wick-as-close': { skill: 'wick', text: 'A wick through a level is sometimes reading as a close through it.', review: ['p2', 15], label: 'Wick vs. Close' },
  'mss-as-entry': { skill: 'bosmss', text: 'MSS is change information. It keeps showing up as an entry signal in your answers.', review: ['p2', 12], label: 'Market Structure Shift' },
  'color-as-structure': { skill: 'contrev', text: 'Candle color is sometimes deciding the read instead of the levels.', review: ['p2', 14], label: 'Retracement vs. Reversal' },
  'one-candle-formula': { skill: 'accrej', text: 'You’re calling acceptance or rejection from one candle. Let the behavior develop.', review: ['p2', 20], label: 'Acceptance vs. Rejection' },
  'kept-junk': { skill: 'levels', text: 'Some lines without a structural job are staying on your chart.', review: ['p2', 23], label: 'Structure-Based Levels' },
  'deleted-structural-level': { skill: 'levels', text: 'You’re sometimes deleting levels that do have a structural job.', review: ['p2', 23], label: 'Structure-Based Levels' },
};

const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k) || fallback); } catch (e) { return JSON.parse(fallback); } };

/** Per-skill accuracy from everything tracked so far. Skills without enough answers say so. */
export function computeMastery(phaseKey = 'p2', skills = PHASE2_SKILLS) {
  const sources = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`aghf_concepts:${phaseKey}-`)) sources.push(read(k, '{}'));
    }
  } catch (e) { /* storage blocked */ }
  const learning = read('aghf_learning', '{"concepts":{},"mistakes":{}}');
  sources.push(learning.concepts || {});
  return skills.map((s) => {
    let right = 0, tries = 0;
    sources.forEach((src) => [...s.keys, s.key].forEach((k) => { if (src[k]) { right += src[k].right || 0; tries += src[k].tries || 0; } }));
    const pct = tries ? Math.round((right / tries) * 100) : null;
    let level = 'none';
    if (tries >= 4) level = pct >= 90 && tries >= 6 ? 'mastered' : pct >= 75 ? 'strong' : 'developing';
    return { ...s, right, tries, pct, level };
  });
}

/** The one or two most useful things to review, from real answers. */
export function nextBestReview(mastery, insights = MISTAKE_INSIGHTS) {
  const learning = read('aghf_learning', '{"concepts":{},"mistakes":{}}');
  const mistakes = Object.entries(learning.mistakes || {}).filter(([k, v]) => insights[k] && v.count >= 2).sort((a, b) => b[1].count - a[1].count);
  const measured = mastery.filter((m) => m.level !== 'none');
  const strong = measured.filter((m) => m.pct >= 80).sort((a, b) => b.pct - a.pct)[0];
  const weak = measured.filter((m) => m.pct < 80).sort((a, b) => a.pct - b.pct).slice(0, 2);
  const items = [];
  if (mistakes[0]) {
    const mi = insights[mistakes[0][0]];
    items.push({ text: mi.text, label: mi.label, review: mi.review });
  }
  weak.forEach((w) => {
    if (items.some((it) => it.review[1] === w.review[1])) return;
    items.push({ text: w.nudge || `Let’s get a few more reps on ${w.phrase || w.label.toLowerCase()}.`, label: w.label, review: w.review });
  });
  return { lead: strong ? `You understand ${strong.phrase || strong.label.toLowerCase()} well.` : null, items: items.slice(0, 2) };
}

/* ── Badges ─────────────────────────────────────────────────────────── */

export function awardBadge(badge) {
  try {
    const all = read('aghf_badges', '[]');
    if (!all.some((b) => b.id === badge.id)) all.push({ ...badge, at: Date.now() });
    localStorage.setItem('aghf_badges', JSON.stringify(all));
  } catch (e) { /* storage blocked */ }
}
export const badges = () => read('aghf_badges', '[]');

/* ── The Phase Final ────────────────────────────────────────────────── */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function drawSet(final) {
  const by = (k) => shuffle(final.bank.filter((it) => (it.kind === 'slide' ? 'visual' : it.kind) === k));
  const mix = final.mix || { visual: 9, mcq: 6, written: 1 };
  // Spread visual items across skills before doubling up on one.
  const visual = [];
  const pool = by('visual');
  const seen = new Set();
  pool.forEach((it) => { if (visual.length < mix.visual && !seen.has(it.skill)) { visual.push(it); seen.add(it.skill); } });
  pool.forEach((it) => { if (visual.length < mix.visual && !visual.includes(it)) visual.push(it); });
  const set = [...visual, ...by('mcq').slice(0, mix.mcq)];
  const written = by('written').slice(0, mix.written || 0);
  // final.capstone: an item that is always asked, last (e.g. a full top-down read from scratch).
  const capstone = (final.capstone || []).map((c) => (typeof c === 'number' ? final.bank[c] : c));
  return [...shuffle(set), ...written, ...capstone];
}

/* A failed Final: strongest skills, what needs another look, and the lessons to revisit. */
function adaptiveReview(per, skillsByKey, final) {
  const rows = Object.entries(per).map(([s, v]) => ({ s: skillsByKey[s], pct: v.right / v.tries })).filter((r) => r.s);
  const strong = rows.filter((r) => r.pct === 1).slice(0, 2);
  const weak = rows.filter((r) => r.pct < 1).sort((a, b) => a.pct - b.pct).slice(0, 2);
  const lessons = weak.map((w) => w.s.review);
  return `<div class="pf-adaptive">
      <div class="lw-eyebrow">${final.reviewTitle || 'Your review'}</div>
      ${strong.length ? `<div class="pf-ad-row ok"><b>Strongest</b>${strong.map((r) => r.s.label).join(' · ')}</div>` : ''}
      ${weak.length ? `<div class="pf-ad-row no"><b>Needs another look</b>${weak.map((r) => r.s.label).join(' · ')}</div>` : ''}
      ${lessons.length ? `<div class="pf-ad-links">${weak.map((w) => `<a href="lesson.html?phase=${w.s.review[0]}&n=${w.s.review[1]}">↻ Lesson ${w.s.review[1]}: ${w.s.label}</a>`).join('')}</div>
        <a class="lw-cc-next pf-ad-cta" href="lesson.html?phase=${lessons[0][0]}&n=${lessons[0][1]}">Review ${lessons.length} lesson${lessons.length > 1 ? 's' : ''} →</a>` : ''}
    </div>`;
}

export function renderPhaseFinal(slide, final, onPass, helpers) {
  const passPct = final.passPct || 0.8;
  const skillsByKey = Object.fromEntries((final.skills || PHASE2_SKILLS).map((s) => [s.key, s]));

  function intro() {
    slide.innerHTML = `<div class="lw-card pf-intro">
        <div class="lw-eyebrow">${final.eyebrow || 'Phase final'}</div>
        <h2>${final.title}</h2>
        ${(final.intro || []).map((p) => `<p>${p}</p>`).join('')}
        <div class="pf-chips">${(final.covers || []).map((c) => `<span>${c}</span>`).join('')}</div>
        <button type="button" class="lw-continue-btn" id="pfStart">Start the Final →</button>
      </div>`;
    slide.querySelector('#pfStart').addEventListener('click', start);
  }

  function start() {
    const set = drawSet(final);
    const graded = set.filter((it) => it.kind !== 'written');
    const results = [];
    let k = 0;

    function show() {
      const it = set[k];
      const n = graded.length;
      const qNum = Math.min(k + 1, set.length);
      slide.innerHTML = `<div class="pf-head"><span class="pf-count">Question ${qNum} of ${set.length}</span>${it.kind !== 'written' && skillsByKey[it.skill] ? `<span class="pf-skill">${skillsByKey[it.skill].label}</span>` : ''}
          <div class="pf-bar"><div style="width:${(k / set.length) * 100}%"></div></div></div><div class="pf-body"></div>`;
      const body = slide.querySelector('.pf-body');
      let wrong = false;
      // A long item (e.g. the Phase 6 trading session) can report per-skill decisions itself.
      const extra = [];
      const itemHelpers = { ...helpers, onPick(q, opt, correct) { if (!correct) wrong = true; }, handleStreak: () => {}, burst: () => {}, report(skill, correct) { extra.push({ skill, correct }); } };
      const advance = () => { k += 1; if (k < set.length) { show(); window.scrollTo({ top: 0, behavior: 'smooth' }); } else finish(); };
      const nextLabel = k + 1 < set.length ? 'Next question →' : 'See my results →';
      const done = () => {
        if (it.kind !== 'written') results.push({ skill: it.skill, correct: !wrong });
        body.querySelectorAll('.lw-continue-btn').forEach((b) => b.remove());
        const next = document.createElement('button');
        next.type = 'button'; next.className = 'lw-continue-btn pf-next';
        next.textContent = nextLabel;
        next.addEventListener('click', advance);
        body.appendChild(next);
      };
      void n;
      if (it.kind === 'mcq') {
        const card = document.createElement('div');
        card.className = 'lw-card pf-card';
        body.appendChild(card);
        askQuestion(card, { prompt: it.prompt, hint: it.hint, concept: null, stack: true, options: it.options }, itemHelpers, done);
      } else if (it.kind === 'written') {
        body.innerHTML = `<div class="lw-card pf-card"><div class="lw-eyebrow">Short written reasoning · not scored</div><h2>${it.prompt}</h2>
            <textarea class="sw-textarea" rows="4" placeholder="Explain it in your own words…"></textarea>
            <button type="button" class="lw-continue-btn" disabled>Submit my reasoning →</button><div class="pf-model"></div></div>`;
        const ta = body.querySelector('textarea'), btn = body.querySelector('.lw-continue-btn');
        ta.addEventListener('input', () => { btn.disabled = ta.value.trim().length < (it.min || 20); });
        btn.addEventListener('click', () => {
          ta.disabled = true; btn.remove();
          try { const notes = read('aghf_notes', '[]'); notes.push({ sectionId: final.notesId || 'p2-final', savedAt: Date.now(), answers: [{ prompt: it.prompt, answer: ta.value.trim() }] }); localStorage.setItem('aghf_notes', JSON.stringify(notes)); } catch (e) { /* storage blocked */ }
          body.querySelector('.pf-model').innerHTML = `<div class="pl-purpose"><div class="pl-panel-title">A strong answer includes</div><p>${it.model}</p></div>`;
          done();
        });
      } else {
        const renderer = SLIDE_RENDERERS[it.slide.type];
        // A chart item shows its own continue button when solved; that button moves on.
        // Quiz items always start fresh, each in its own save slot.
        renderer(body, { ...it.slide, kicker: it.slide.kicker ?? '', cta: nextLabel, ephemeral: true, save: `${final.storeId || 'final'}-q${k}` }, () => { if (extra.length) results.push(...extra); else results.push({ skill: it.skill, correct: !wrong }); advance(); }, itemHelpers);
      }
    }

    function finish() {
      const right = results.filter((r) => r.correct).length;
      const pct = results.length ? Math.round((right / results.length) * 100) : 100;
      const passed = pct >= passPct * 100;
      // Store per skill so the mastery profile reflects the Final.
      const per = {};
      results.forEach((r) => { per[r.skill] = per[r.skill] || { right: 0, tries: 0 }; per[r.skill].tries += 1; if (r.correct) per[r.skill].right += 1; });
      try {
        const key = `aghf_concepts:${final.storeId || 'p2-final'}`;
        const all = read(key, '{}');
        Object.entries(per).forEach(([s, v]) => { const c = all[s] || { right: 0, tries: 0, missed: 0 }; c.right += v.right; c.tries += v.tries; c.missed += v.tries - v.right; c.final = Date.now(); all[s] = c; });
        localStorage.setItem(key, JSON.stringify(all));
      } catch (e) { /* storage blocked */ }
      const missed = Object.entries(per).filter(([, v]) => v.right < v.tries).map(([s]) => skillsByKey[s]).filter(Boolean);
      slide.innerHTML = `<div class="lw-card sw-result-card pf-result">
          <div class="lw-eyebrow">${final.title}</div>
          <div class="sw-result-pct ${passed ? 'pass' : 'fail'}">${pct}%</div>
          <div class="sw-result-sub">${right} of ${results.length} scored questions right, ${passed ? `you passed (${Math.round(passPct * 100)}% required)` : `${Math.round(passPct * 100)}% required to pass`}</div>
          <div class="pf-skillgrid">${Object.entries(per).map(([s, v]) => `<div class="${v.right === v.tries ? 'ok' : 'no'}"><span>${skillsByKey[s]?.label || s}</span><b>${v.right}/${v.tries}</b></div>`).join('')}</div>
          ${!passed && final.adaptive ? adaptiveReview(per, skillsByKey, final) : missed.length ? `<div class="sw-review"><strong>${passed ? 'Give these another look:' : 'Give these another look, then try a fresh set:'}</strong><ul>${missed.map((m) => `<li>↻ ${m.label}<a href="lesson.html?phase=${m.review[0]}&n=${m.review[1]}">Review this lesson →</a></li>`).join('')}</ul></div>` : ''}
          <button type="button" class="lw-continue-btn" id="pfAfter" style="align-self:center">${passed ? 'Continue →' : (final.retryLabel || 'Try again, new questions')}</button>
        </div>`;
      slide.querySelector('#pfAfter').addEventListener('click', () => (passed ? onPass(pct) : start()));
    }
    show();
  }
  intro();
}

/* ── Phase completion ───────────────────────────────────────────────── */

// The Phase 3 ending: overlays flash on a chart, then fade away to clean candles.
const CLEAN_CHART = `<svg class="pc-clean" viewBox="0 0 320 120" aria-hidden="true">
  <g class="pc-ovl"><rect x="150" y="40" width="160" height="16" rx="4" fill="#7ECEC4" opacity=".35"/><rect x="40" y="78" width="270" height="10" rx="3" fill="#F4829A" opacity=".3"/>
  <line x1="20" x2="310" y1="30" y2="30" stroke="#7F77DD" stroke-width="2" stroke-dasharray="6 5"/><line x1="20" x2="310" y1="96" y2="96" stroke="#F5A857" stroke-width="2" stroke-dasharray="6 5"/>
  <rect x="96" y="58" width="80" height="22" rx="4" fill="#F5A857" opacity=".25"/><text x="300" y="26" text-anchor="end" font-size="9" font-weight="800" fill="#5E56B8">BSL</text></g>
  ${[[30, 92, 84], [50, 84, 88], [70, 88, 74], [90, 74, 78], [110, 78, 60], [130, 60, 66], [150, 66, 50], [170, 50, 56], [190, 56, 44], [210, 44, 48], [230, 48, 36], [250, 36, 42], [270, 42, 30]].map(([x, o, c]) => `<g><line x1="${x}" x2="${x}" y1="${Math.min(o, c) - 4}" y2="${Math.max(o, c) + 4}" stroke="${c < o ? '#7ECEC4' : '#F4829A'}" stroke-width="2"/><rect x="${x - 5}" y="${Math.min(o, c)}" width="10" height="${Math.max(3, Math.abs(o - c))}" rx="2" fill="${c < o ? '#7ECEC4' : '#F4829A'}"/></g>`).join('')}
</svg>`;

// The Phase 4 ending: her framework draws itself onto a clean chart, then fades away.
function frameworkHtml(fw) {
  const bars = [[24, 96, 88], [40, 88, 92], [56, 92, 78], [72, 78, 84], [88, 84, 98], [104, 98, 104], [120, 104, 90], [136, 90, 74], [152, 74, 62], [168, 62, 66], [184, 66, 50], [200, 50, 40], [216, 40, 46], [232, 46, 60], [248, 60, 68], [264, 68, 58], [280, 58, 64], [296, 64, 56]];
  const candles = bars.map(([x, o, c]) => `<g><line x1="${x}" x2="${x}" y1="${Math.min(o, c) - 4}" y2="${Math.max(o, c) + 4}" stroke="${c < o ? '#7ECEC4' : '#F4829A'}" stroke-width="2"/><rect x="${x - 5}" y="${Math.min(o, c)}" width="10" height="${Math.max(3, Math.abs(o - c))}" rx="2" fill="${c < o ? '#7ECEC4' : '#F4829A'}"/></g>`).join('');
  const ovl = `<g class="pc-fw-ovl">
    <rect x="96" y="36" width="216" height="72" rx="4" fill="#7F77DD" opacity=".1"/>
    <line x1="96" x2="312" y1="36" y2="36" stroke="#7F77DD" stroke-width="2.5"/><line x1="96" x2="312" y1="108" y2="108" stroke="#7F77DD" stroke-width="2.5"/>
    <line x1="96" x2="312" y1="72" y2="72" stroke="#7F77DD" stroke-width="1.5" stroke-dasharray="5 4"/>
    <circle cx="296" cy="56" r="4.5" fill="#2C1810"/><circle cx="104" cy="104" r="4" fill="#F5A857"/>
    <line x1="300" x2="300" y1="40" y2="54" stroke="#F5A857" stroke-width="2"/></g>`;
  let k = 0;
  const groups = fw.groups.map((g) => `<div class="pc-fw-g"><b>${g.title}</b>${g.items.map((it) => `<span style="animation-delay:${0.5 + (k++) * 0.42}s">${it}</span>`).join('')}</div>`).join('<i class="pc-fw-arrow">↓</i>');
  const total = 0.5 + k * 0.42;
  return `<div class="pc-fw" style="--fw-out:${total + 1.2}s">
      <svg class="pc-fw-chart" viewBox="0 0 320 130" aria-hidden="true">${candles}${ovl}</svg>
      <div class="pc-fw-list">${groups}</div>
      ${fw.headline ? `<div class="pc-fw-head" style="animation-delay:${total + 1.8}s">${fw.headline}</div>` : ""}
    </div>`;
}

/* Lines that appear one by one when the card scrolls into view. */
function pauseHtml(pz) {
  let d = 0;
  const line = (t, cls = '') => `<p class="pc-pz ${cls}" style="animation-delay:${(d += 0.9)}s">${t}</p>`;
  return `<div class="lw-card pc-pause">
      ${pz.lines.map((t) => line(t)).join('')}
      ${pz.recap ? `<ul class="pc-pz pc-recap" style="animation-delay:${(d += 0.9)}s">${pz.recap.map((r) => `<li>${r}</li>`).join('')}</ul>` : ''}
      ${pz.ready ? line(pz.ready, 'pc-ready') : ''}
    </div>`;
}

const LEVEL_TEXT = { mastered: 'Mastered', strong: 'Strong', developing: 'Developing', none: 'Not enough data yet' };

export function renderPhaseComplete(slide, data, { flagKey, backHref, results }) {
  const c = data.phaseComplete;
  try {
    localStorage.setItem(flagKey, 'true');
    localStorage.setItem(`aghf_phase_clear:${c.phaseKey}`, 'true');
  } catch (e) { /* storage blocked */ }
  awardBadge({ id: c.badge.id, title: c.badge.title, emoji: c.badge.emoji, phase: c.phaseKey });
  try {
    const prof = read('aghf_learning_profile', '{}');
    prof[c.phaseKey] = { ...(prof[c.phaseKey] || {}), completedAt: Date.now(), finalPct: results.finalPct };
    localStorage.setItem('aghf_learning_profile', JSON.stringify(prof));
  } catch (e) { /* storage blocked */ }

  const mastery = computeMastery(c.phaseKey, c.skills || PHASE2_SKILLS);
  const review = nextBestReview(mastery, { ...MISTAKE_INSIGHTS, ...(c.insights || {}) });
  const fill = (s) => String(s).replace('{final}', results.finalPct ?? '80+');
  slide.innerHTML = `
    <div class="pc-hero">
      <div class="pc-rays"></div>
      ${c.framework ? frameworkHtml(c.framework) : c.cleanChart ? CLEAN_CHART : ''}
      <div class="pc-eyebrow">${c.eyebrow}</div>
      <h1>${c.heading}</h1>
      <div class="pc-sub">${c.sub}</div>
      <div class="pc-stats">${c.stats.map((s) => `<div class="pc-stat"><b>${fill(s.value)}</b><span>${s.label}</span></div>`).join('')}</div>
    </div>
    <div class="lw-card pc-badge-card">
      <div class="pc-badge-eyebrow">🏆 Badge unlocked</div>
      <div class="pc-medal"><svg viewBox="0 0 160 160" aria-hidden="true"><defs><linearGradient id="pcG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F9B8C6"/><stop offset=".55" stop-color="#F5A857"/><stop offset="1" stop-color="#7F77DD"/></linearGradient></defs>
        <circle class="pc-ring" cx="80" cy="80" r="70" fill="none" stroke="url(#pcG)" stroke-width="6"/><circle cx="80" cy="80" r="58" fill="#fff"/><circle cx="80" cy="80" r="58" fill="url(#pcG)" opacity=".14"/>
        ${c.badge.mark === 'target' ? '<circle class="pc-stairs" cx="80" cy="80" r="34" fill="none" stroke="#2C1810" stroke-width="5"/><circle class="pc-stairs" cx="80" cy="80" r="18" fill="none" stroke="#2C1810" stroke-width="5"/><circle cx="80" cy="80" r="5" fill="#F4829A"/><polyline class="pc-stairs" points="58,58 76,50 80,64 96,46 104,58" fill="none" stroke="#7F77DD" stroke-width="3" stroke-linejoin="round"/>'
          : c.badge.mark === 'diamond' ? '<polygon class="pc-stairs" points="80,42 112,74 80,118 48,74" fill="none" stroke="#2C1810" stroke-width="5" stroke-linejoin="round"/><line class="pc-stairs" x1="48" y1="74" x2="112" y2="74" stroke="#2C1810" stroke-width="4"/><polyline class="pc-stairs" points="64,58 80,74 96,58" fill="none" stroke="#2C1810" stroke-width="4" stroke-linejoin="round"/>'
          : '<polyline class="pc-stairs" points="44,104 60,104 60,88 76,88 76,72 92,72 92,56 112,56" fill="none" stroke="#2C1810" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>'}</svg>
        <span class="pc-shine"></span></div>
      <h2>${c.badge.title} ${c.badge.emoji}</h2>
      <p class="pc-quote">${c.badge.quote}</p>
      <div class="pc-saved">Added to your Academy profile</div>
    </div>
    <div class="lw-card pc-mastery">
      <div class="lw-eyebrow">${c.masteryTitle || 'My learning · Your structure skills'}</div>
      <div class="pc-skills">${mastery.map((m) => `<div class="pc-skill pc-${m.level}"><span>${m.label}</span><b>${LEVEL_TEXT[m.level]}</b>${m.level !== 'none' ? `<i style="--w:${m.pct}%"></i>` : ''}</div>`).join('')}</div>
      <p class="pc-note">${c.masteryNote || 'Based on your answers across Phase 2. Skills without enough answers yet say so instead of guessing.'}</p>
      ${review.items.length ? `<div class="pc-review"><div class="lw-eyebrow">Your next best review</div>${review.lead ? `<p>${review.lead}</p>` : ''}
        ${review.items.map((it) => `<div class="pc-review-row"><p>${it.text}</p><a href="lesson.html?phase=${it.review[0]}&n=${it.review[1]}">Review ${it.label} →</a></div>`).join('')}</div>` : ''}
    </div>
    ${c.pause ? pauseHtml(c.pause) : ''}
    <div class="lw-card pc-next${c.next.method ? ' pc-method' : ''}">
      <div class="lw-eyebrow">🔓 ${c.next.eyebrow}</div>
      <h2>${c.next.title}</h2>
      ${c.next.lines.map((l) => `<p>${l}</p>`).join('')}
      ${c.next.topics ? `<ul class="pc-topics">${c.next.topics.map((t) => `<li>${t}</li>`).join('')}</ul>` : ''}
      ${c.next.distinction ? `<div class="pc-distinction">${c.next.distinction}</div>` : ''}
      ${c.next.note ? `<div class="pc-distinction">${c.next.note}</div>` : ''}
      ${c.next.preview ? `<div class="pc-preview">${c.next.preview.map((p) => `<div>${p}</div>`).join('')}</div>` : ''}
      ${c.next.sections ? `<div class="pc-msec">${c.next.sections.map((sec) => `<div class="pc-msec-c"><small>${sec.label}</small><b>${sec.title}</b><span>${sec.items.join(' <i>→</i> ')}</span></div>`).join('')}</div>` : ''}
      <button type="button" class="lw-cc-next" id="pcNext">${c.next.cta}</button>
    </div>
    <div class="lw-back-link"><a href="${backHref}">← Back to all lessons</a></div>`;
  slide.querySelector('#pcNext').addEventListener('click', () => { window.location.href = c.next.href || backHref; });
  const pz = slide.querySelector('.pc-pause');
  if (pz) {
    const go = () => pz.classList.add('go');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { go(); io.disconnect(); } }, { threshold: 0.3 });
      io.observe(pz);
    } else go();
  }
}
