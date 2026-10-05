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
export function nextBestReview(mastery) {
  const learning = read('aghf_learning', '{"concepts":{},"mistakes":{}}');
  const mistakes = Object.entries(learning.mistakes || {}).filter(([k, v]) => MISTAKE_INSIGHTS[k] && v.count >= 2).sort((a, b) => b[1].count - a[1].count);
  const measured = mastery.filter((m) => m.level !== 'none');
  const strong = measured.filter((m) => m.pct >= 80).sort((a, b) => b.pct - a.pct)[0];
  const weak = measured.filter((m) => m.pct < 80).sort((a, b) => a.pct - b.pct).slice(0, 2);
  const items = [];
  if (mistakes[0]) {
    const mi = MISTAKE_INSIGHTS[mistakes[0][0]];
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
  return [...shuffle(set), ...written];
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
      const itemHelpers = { ...helpers, onPick(q, opt, correct) { if (!correct) wrong = true; }, handleStreak: () => {}, burst: () => {} };
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
        renderer(body, { ...it.slide, kicker: it.slide.kicker ?? '', cta: nextLabel }, () => { results.push({ skill: it.skill, correct: !wrong }); advance(); }, itemHelpers);
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
          ${missed.length ? `<div class="sw-review"><strong>${passed ? 'Give these another look:' : 'Give these another look, then try a fresh set:'}</strong><ul>${missed.map((m) => `<li>↻ ${m.label}<a href="lesson.html?phase=${m.review[0]}&n=${m.review[1]}">Review this lesson →</a></li>`).join('')}</ul></div>` : ''}
          <button type="button" class="lw-continue-btn" id="pfAfter" style="align-self:center">${passed ? 'Continue →' : 'Try again, new questions'}</button>
        </div>`;
      slide.querySelector('#pfAfter').addEventListener('click', () => (passed ? onPass(pct) : start()));
    }
    show();
  }
  intro();
}

/* ── Phase completion ───────────────────────────────────────────────── */

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

  const mastery = computeMastery(c.phaseKey);
  const review = nextBestReview(mastery);
  const fill = (s) => String(s).replace('{final}', results.finalPct ?? '80+');
  slide.innerHTML = `
    <div class="pc-hero">
      <div class="pc-rays"></div>
      <div class="pc-eyebrow">${c.eyebrow}</div>
      <h1>${c.heading}</h1>
      <div class="pc-sub">${c.sub}</div>
      <div class="pc-stats">${c.stats.map((s) => `<div class="pc-stat"><b>${fill(s.value)}</b><span>${s.label}</span></div>`).join('')}</div>
    </div>
    <div class="lw-card pc-badge-card">
      <div class="pc-badge-eyebrow">🏆 Badge unlocked</div>
      <div class="pc-medal"><svg viewBox="0 0 160 160" aria-hidden="true"><defs><linearGradient id="pcG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F9B8C6"/><stop offset=".55" stop-color="#F5A857"/><stop offset="1" stop-color="#7F77DD"/></linearGradient></defs>
        <circle class="pc-ring" cx="80" cy="80" r="70" fill="none" stroke="url(#pcG)" stroke-width="6"/><circle cx="80" cy="80" r="58" fill="#fff"/><circle cx="80" cy="80" r="58" fill="url(#pcG)" opacity=".14"/>
        <polyline class="pc-stairs" points="44,104 60,104 60,88 76,88 76,72 92,72 92,56 112,56" fill="none" stroke="#2C1810" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/></svg>
        <span class="pc-shine"></span></div>
      <h2>${c.badge.title} ${c.badge.emoji}</h2>
      <p class="pc-quote">${c.badge.quote}</p>
      <div class="pc-saved">Added to your Academy profile</div>
    </div>
    <div class="lw-card pc-mastery">
      <div class="lw-eyebrow">My learning · Your structure skills</div>
      <div class="pc-skills">${mastery.map((m) => `<div class="pc-skill pc-${m.level}"><span>${m.label}</span><b>${LEVEL_TEXT[m.level]}</b>${m.level !== 'none' ? `<i style="--w:${m.pct}%"></i>` : ''}</div>`).join('')}</div>
      <p class="pc-note">Based on your answers across Phase 2. Skills without enough answers yet say so instead of guessing.</p>
      ${review.items.length ? `<div class="pc-review"><div class="lw-eyebrow">Your next best review</div>${review.lead ? `<p>${review.lead}</p>` : ''}
        ${review.items.map((it) => `<div class="pc-review-row"><p>${it.text}</p><a href="lesson.html?phase=${it.review[0]}&n=${it.review[1]}">Review ${it.label} →</a></div>`).join('')}</div>` : ''}
    </div>
    <div class="lw-card pc-next">
      <div class="lw-eyebrow">🔓 ${c.next.eyebrow}</div>
      <h2>${c.next.title}</h2>
      ${c.next.lines.map((l) => `<p>${l}</p>`).join('')}
      ${c.next.topics ? `<ul class="pc-topics">${c.next.topics.map((t) => `<li>${t}</li>`).join('')}</ul>` : ''}
      ${c.next.distinction ? `<div class="pc-distinction">${c.next.distinction}</div>` : ''}
      ${c.next.preview ? `<div class="pc-preview">${c.next.preview.map((p) => `<div>${p}</div>`).join('')}</div>` : ''}
      <button type="button" class="lw-cc-next" id="pcNext">${c.next.cta}</button>
    </div>
    <div class="lw-back-link"><a href="${backHref}">← Back to all lessons</a></div>`;
  slide.querySelector('#pcNext').addEventListener('click', () => { window.location.href = c.next.href || backHref; });
}
