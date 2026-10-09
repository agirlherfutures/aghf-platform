/**
 * capstone.js — A Girl & Her Futures™
 *
 * The graduation gate. Sits outside the 8 phases and 22 sections.
 * One continuous trading day in 7 parts, no hints, no indicator.
 * Scored on process, not profit: a valid loser passes, a lucky rule break doesn't.
 */
import { renderCase } from './casefile.js';
import { reasoningDiff, compareChoice, riskOf, tolerance } from './case-core.js';
import {
  scoreCapstone, saveCapstoneAttempt, capstoneAttempts, graduate, graduated, alumni,
  saveReflections, currentPlan, curriculumComplete, METHOD_VERSION,
} from './desk-core.js';
import { awardBadge, badges } from './phase-final.js';
import { loadRiskProfile } from './risk-core.js';
import { PHASES, inStructureTitle } from './curriculum-data.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const MAX_RISK = 200;
export const GRAD_BADGE = { id: 'p8-graduate', title: 'YOU’RE IN STRUCTURE', emoji: '🎓', phase: 'capstone' };
export const GRAD_GP = 1500;

export const PARTS = [
  ['PART 1', 'Read the room', '4H'],
  ['PART 2', 'Build the map', '1H'],
  ['PART 3', 'Observe', '15M'],
  ['PART 4', 'Execute', '1M'],
  ['PART 5', 'Protect', 'Risk'],
  ['PART 6', 'Manage + review', 'Outcome'],
  ['PART 7', 'Reflect', 'You'],
];

const AREAS = {
  analysis: { label: 'Analysis', fix: [[1, 'How to Break Down a Trade'], [10, 'Full Top-to-Bottom Breakdown']] },
  execution: { label: 'Execution', fix: [[8, 'Right Analysis. Wrong Execution.'], [6, 'Why I Passed This Trade']] },
  risk: { label: 'Risk', fix: [[2, 'A Valid Winning Trade'], [8, 'Right Analysis. Wrong Execution.']] },
  management: { label: 'Management', fix: [[3, 'A Valid Losing Trade'], [7, 'The Missed Trade']] },
  ruleAdherence: { label: 'Rule adherence', fix: [[4, 'An Invalid Winning Trade'], [5, 'Clean vs Messy Setups']] },
  review: { label: 'Review', fix: [[3, 'A Valid Losing Trade'], [4, 'An Invalid Winning Trade']] },
};

// ── which day she gets ────────────────────────────────────────────────────
/** First attempt is always the valid loser. Retries draw a different day at random. */
export function pickVariant(pool, forced) {
  if (forced) { const f = pool.find((p) => p.variant === forced); if (f) return f; }
  const tries = capstoneAttempts();
  if (!tries.length) return pool.find((p) => p.variant === 'VALID_LOSS') || pool[0];
  const last = tries[tries.length - 1].variant;
  const rest = pool.filter((p) => p.variant !== 'VALID_LOSS' && p.variant !== last);
  return rest[Math.floor(Math.random() * rest.length)] || pool[0];
}

// ── scoring: process, not profit ──────────────────────────────────────────
export function scoreRun(c, rec) {
  const ex = c.expert || {};
  const scores = {}; const notes = {}; const critical = [];
  const d = rec.decision || {};
  const took = d.choice === 'TAKE';

  // Analysis: how much of her top-down read agreed with the chart.
  const read = reasoningDiff(c, rec).filter((r) => ['4H', '1H', '15M', '1M'].includes(r.stage));
  const ok = read.filter((r) => r.status === 'MATCHED' || r.status === 'NEEDS REVIEW').length;
  const ratio = read.length ? ok / read.length : 1;
  scores.analysis = ratio >= 0.75 ? 'STRONG' : ratio >= 0.5 ? 'SOLID' : 'REVIEW';
  notes.analysis = `${ok} of ${read.length} reads lined up with the chart.`;

  // Execution: the participation decision against what the sequence allowed.
  const st = compareChoice({ expert: ex.idealDecision, alt: ex.altDecisions }, d.choice);
  if (took && ex.idealDecision !== 'TAKE') {
    scores.execution = 'REVIEW';
    critical.push(`Entered without the plan’s permission. ${ex.decisionWhy || ''}`.trim());
    notes.execution = `You took it. The plan said ${ex.idealDecision}.`;
  } else if (st === 'MATCHED') {
    scores.execution = 'STRONG'; notes.execution = `${d.choice}: the same call the sequence supported.`;
  } else if (st === 'NEEDS REVIEW' || (d.choice === 'WAIT' && ex.idealDecision === 'TAKE')) {
    scores.execution = 'SOLID'; notes.execution = `${d.choice} is defensible. ${ex.decisionWhy || ''}`.trim();
  } else {
    scores.execution = 'REVIEW'; notes.execution = `${d.choice || 'No decision'} on a complete sequence. ${ex.decisionWhy || ''}`.trim();
  }

  // Risk: inside the account constraint, stop on the right side and beyond the correction.
  if (took) {
    const r = riskOf(c, d);
    const long = c.dir !== 'short';
    const tol = tolerance(c, '1M');
    if (!r.sane) { scores.risk = 'REVIEW'; critical.push('Stop or target on the wrong side of the entry.'); notes.risk = 'The stop has to sit on the losing side of the entry.'; }
    else if (r.dollars > MAX_RISK) { scores.risk = 'REVIEW'; critical.push(`Risked $${r.dollars}. The account allows $${MAX_RISK} per trade.`); notes.risk = `$${r.dollars} at ${d.contracts} contract${d.contracts === 1 ? "" : "s"}: over the limit.`; }
    else {
      const ref = ex.risk?.stop;
      const inside = ref != null && (long ? d.stop > ref + tol : d.stop < ref - tol);
      if (inside) { scores.risk = 'SOLID'; notes.risk = `$${r.dollars} is inside the limit, but the stop sits inside the correction (${ref} protects the idea).`; }
      else if (r.rr < 1) { scores.risk = 'SOLID'; notes.risk = `$${r.dollars} inside the limit. The target is under 1R.`; }
      else { scores.risk = 'STRONG'; notes.risk = `$${r.dollars} at ${d.contracts} contract${d.contracts === 1 ? "" : "s"}, ${r.rr}R target. Inside the $${MAX_RISK} limit.`; }
    }
  } else { scores.risk = 'STRONG'; notes.risk = 'No position. Capital protected.'; }

  // Management: when the trade tested her, did she follow the plan she set before?
  if (took && rec.temptation) {
    scores.management = rec.temptation.followedPlan ? 'STRONG' : 'REVIEW';
    notes.management = rec.temptation.followedPlan ? 'Price pulled back and you kept the plan.' : `You chose “${rec.temptation.choice}” mid-trade. The plan said otherwise.`;
  } else if (took) { scores.management = rec.mgmt ? 'STRONG' : 'SOLID'; notes.management = rec.mgmt ? `Plan set before entry: ${rec.mgmt}.` : 'No management plan set.'; }
  else { scores.management = 'STRONG'; notes.management = 'Nothing to manage.'; }

  // Rule adherence: anything that broke a hard rule.
  scores.ruleAdherence = critical.length ? 'REVIEW' : (!took && !(d.reasons || []).length ? 'SOLID' : 'STRONG');
  notes.ruleAdherence = critical.length ? 'A hard rule was broken.' : took ? 'Every rule held.' : (d.reasons || []).length ? `You named why: ${d.reasons.join(', ')}.` : 'You stood aside, but didn’t name the rule.';

  // Review: did the outcome rewrite her grade?
  const changed = /^Yes/.test(rec.asks?.changeGrade || '');
  scores.review = changed ? 'REVIEW' : 'STRONG';
  notes.review = changed ? 'You let the outcome change your grade.' : 'The outcome didn’t rewrite your grade.';

  const verdict = scoreCapstone({ scores, critical });
  return { scores, notes, critical, ...verdict, outcome: c.outcome?.type, rResult: c.outcome?.r };
}

// ── screens ───────────────────────────────────────────────────────────────
export function renderIntro(el, { name, onBegin, attempts = 0 }) {
  el.innerHTML = `<div class="cap-intro">
    <div class="cap-kicker">THE GRADUATION GATE 🎓</div>
    <h1 class="cap-h">${name ? `${esc(name)}, show` : 'Show'} me how you think<br>without the training wheels.</h1>
    <p class="cap-lead">One continuous trading day. No hints. No indicator. No Dayli before you decide.</p>
    <div class="cap-parts">${PARTS.map(([p, t, tf]) => `<div class="cap-part"><span>${p}</span><b>${t}</b><em>${tf}</em></div>`).join('')}</div>
    <div class="cap-rules">
      <div><b>Allowed</b>Your Trading Plan, your Rulebook and your Risk Profile.</div>
      <div><b>The account</b>$50,000 evaluation · $${MAX_RISK} max risk per trade · $600 daily loss limit.</div>
      <div><b>The standard</b>Scored on process, not profit. A valid loss can pass. A lucky rule break can’t.</div>
    </div>
    ${attempts ? `<p class="cap-dim">Attempt ${attempts + 1}. This is a different day from the last one.</p>` : ''}
    <button type="button" class="p8-btn is-lock cap-go">BEGIN CAPSTONE →</button>
  </div>`;
  el.querySelector('.cap-go').addEventListener('click', onBegin);
}

export function renderRefs(el) {
  const prof = loadRiskProfile();
  const plan = currentPlan();
  el.innerHTML = `<div class="cap-refs"><span class="cap-refs-l">YOUR REFERENCES</span>
    <a href="desk.html#plan" target="_blank" rel="noopener">My Trading Plan${plan ? ` v${esc(plan.version)}` : ''} ↗</a>
    <a href="rulebook.html" target="_blank" rel="noopener">My Rulebook ↗</a>
    <button type="button" class="cap-rp">My Risk Profile ▾</button>
    <div class="cap-rp-box" hidden>${prof ? [['Max risk per trade', prof.riskPerTradeLimit && `$${prof.riskPerTradeLimit}`], ['Max daily loss', prof.dailyLossLimitDollar && `$${prof.dailyLossLimitDollar}`], ['Max trades per day', prof.maxTradesPerDay], ['Stop trading when', prof.stopTradingWhen]].filter(([, v]) => v).map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('') : '<div>No saved risk profile. Use the account parameters in the case file.</div>'}</div>
  </div>`;
  el.querySelector('.cap-rp').addEventListener('click', () => { const b = el.querySelector('.cap-rp-box'); b.hidden = !b.hidden; });
}

export function runCapstone(el, item, onDone) {
  const slide = { case: JSON.parse(JSON.stringify(item.case)), steps: item.steps };
  renderCase(el, slide, null, {}, { fresh: true, source: 'CAPSTONE', onDone: (rec) => onDone(scoreRun(slide.case, rec), slide.case, rec) });
}

const TONE = { STRONG: 'is-strong', SOLID: 'is-solid', REVIEW: 'is-review' };
function scoreRows(res) {
  return Object.entries(AREAS).map(([k, a]) => `<div class="cap-row ${TONE[res.scores[k]]}"><span>${a.label}</span><b>${res.scores[k]}</b><em>${esc(res.notes[k])}</em></div>`).join('');
}
const OUT = { WIN: 'The trade won', LOSS: 'The trade lost', WOULD_HAVE_WON: 'It would have won', WOULD_HAVE_LOST: 'It would have lost', CHOP: 'Price chopped' };

export function renderResult(el, res, c, { onContinue, onRetry }) {
  const lossPass = res.pass && res.outcome === 'LOSS';
  el.innerHTML = `<div class="cap-result">
    <div class="cap-kicker">${res.pass ? 'CAPSTONE PASSED ✓' : 'CAPSTONE REVIEW NEEDED'}</div>
    <h2 class="cap-h2">${res.pass ? (lossPass ? 'Your trade lost. You passed.' : 'You traded your plan.') : 'Not yet. Here’s exactly what to sharpen.'}</h2>
    <p class="cap-lead">${res.pass ? (lossPass ? 'That’s the whole point. The process was right, so the loss was a cost of doing business, not a verdict on you.' : 'The result is information. The process is what passed.') : 'This isn’t a fail. It’s a review. Your strengths stay yours, and the retry is a different day.'}</p>
    <div class="cap-outcome"><span>OUTCOME · INFORMATIONAL ONLY</span><b>${esc(OUT[res.outcome] || res.outcome || '·')}</b></div>
    <div class="cap-rows">${scoreRows(res)}</div>
    ${res.crit.length ? `<div class="cap-crit"><div class="cap-sub">CRITICAL</div>${res.crit.map((x) => `<div>✕ ${esc(x)}</div>`).join('')}</div>` : ''}
    ${res.pass ? '' : reviewPlan(res)}
    <div class="cap-actions">${res.pass ? '<button type="button" class="p8-btn is-lock cap-next">PART 7 · REFLECT →</button>' : '<button type="button" class="p8-btn is-lock cap-retry">RETRY CAPSTONE →</button><a class="p8-btn" href="desk.html">Practice on My Trader Desk</a>'}</div>
  </div>`;
  el.querySelector('.cap-next')?.addEventListener('click', onContinue);
  el.querySelector('.cap-retry')?.addEventListener('click', onRetry);
}

function reviewPlan(res) {
  const weak = Object.keys(AREAS).filter((k) => res.scores[k] === 'REVIEW');
  const strong = Object.keys(AREAS).filter((k) => res.scores[k] === 'STRONG');
  const seen = new Set(); const cases = [];
  weak.concat(Object.keys(AREAS).filter((k) => res.scores[k] === 'SOLID')).forEach((k) => AREAS[k].fix.forEach(([n, t]) => { if (!seen.has(n) && cases.length < 5) { seen.add(n); cases.push([n, t, AREAS[k].label]); } }));
  [[10, 'Full Top-to-Bottom Breakdown'], [1, 'How to Break Down a Trade'], [3, 'A Valid Losing Trade']].forEach(([n, t]) => { if (!seen.has(n) && cases.length < 5) { seen.add(n); cases.push([n, t, 'Full breakdown']); } });
  return `<div class="cap-plan">
    <div><div class="cap-sub">STRENGTHS</div>${strong.map((k) => `<div class="cap-li is-ok">✓ ${AREAS[k].label}</div>`).join('') || '<div class="cap-li">You finished the whole day. That counts.</div>'}</div>
    <div><div class="cap-sub">REVIEW AREAS</div>${weak.map((k) => `<div class="cap-li is-rev">○ ${AREAS[k].label}</div>`).join('') || '<div class="cap-li">Critical rule above.</div>'}</div>
    <div class="cap-cases"><div class="cap-sub">5 TARGETED CASES BEFORE YOUR RETRY</div>${cases.map(([n, t, why]) => `<a href="lesson.html?phase=p8&n=${n}" target="_blank" rel="noopener"><b>${esc(t)}</b><span>${esc(why)}</span></a>`).join('')}</div>
  </div>`;
}

export const REFLECT_QS = [
  ['changed', 'What changed in how you read a chart since Phase 1?'],
  ['protects', 'Which rule protects you the most, and why?'],
  ['next', 'What is the ONE thing you’ll practice first as a graduate?'],
];
export function renderReflect(el, onSave) {
  el.innerHTML = `<div class="cap-result">
    <div class="cap-kicker">PART 7 · REFLECT</div><h2 class="cap-h2">Before you walk out the door.</h2>
    <p class="cap-lead">Three answers. They go on your alumni profile, so future you can read them.</p>
    ${REFLECT_QS.map(([k, q]) => `<label class="cap-q">${q}<textarea rows="3" data-k="${k}" placeholder="In your own words…"></textarea></label>`).join('')}
    <div class="cap-actions"><button type="button" class="p8-btn is-lock cap-save" disabled>SAVE + GRADUATE 🎓</button></div>
  </div>`;
  const tas = [...el.querySelectorAll('textarea')]; const b = el.querySelector('.cap-save');
  tas.forEach((t) => t.addEventListener('input', () => { b.disabled = !tas.every((x) => x.value.trim().length >= 6); }));
  b.addEventListener('click', () => onSave(Object.fromEntries(tas.map((t) => [t.dataset.k, t.value.trim()]))));
}

/** Records graduation: alumni profile, badge, reflections. Returns the alumni record. */
export function completeGraduation({ name, attempt, answers }) {
  saveReflections(answers);
  awardBadge(GRAD_BADGE);
  const plan = currentPlan();
  return graduate({ name: name || '', attemptId: attempt.attemptId, variant: attempt.variant, planVersion: plan?.version || null, methodVersion: METHOD_VERSION.label, badges: badges().map((b) => b.id), gp: GRAD_GP });
}

export function renderGraduation(el, a) {
  const phases = PHASES.slice(0, 8);
  const n = (a.badges || []).length;
  const t0 = phases.length * 0.45 + 0.6;
  // Personal spot: "Dayli’s In Structure" when the first name is known, else "You’re In Structure".
  const first = String(a.name || '').trim().split(/\s+/)[0] || '';
  const struct = inStructureTitle(first);
  const phaseTitle = (p) => (p.key === 'p8' ? `${struct} ✦` : p.title);
  el.innerHTML = '';
  document.querySelector('.cap-cine')?.remove();
  const host = document.createElement('div');
  document.body.appendChild(host);
  host.innerHTML = `<div class="cap-cine" role="dialog" aria-label="Graduation">
    <div class="cap-cine-in">
      <div class="cap-ph">${phases.map((p, i) => `<div class="cap-ph-i" style="animation-delay:${0.4 + i * 0.45}s"><i>${p.n}</i><span>${esc(phaseTitle(p))}</span></div>`).join('')}</div>
      <div class="cap-stats" style="animation-delay:${t0}s">
        <div><b>8</b>phases</div><div><b>22</b>sections</div><div><b>${n}</b>badges</div><div><b>+${GRAD_GP}</b>GP</div><div><b>${a.planVersion ? `v${esc(a.planVersion)}` : '✓'}</b>trading plan</div><div><b>PASSED</b>capstone</div>
      </div>
      <div class="cap-grad" style="animation-delay:${t0 + 1}s">🎓 ${first ? esc(first.toUpperCase()) : 'YOU'} GRADUATED</div>
      <div class="cap-struct" style="animation-delay:${t0 + 1.8}s">✦ ${esc(struct.toUpperCase())}.</div>
      <p class="cap-quote" style="animation-delay:${t0 + 2.6}s">You came here to learn a strategy.<br>You leave knowing how to think like a trader.</p>
      <div class="cap-cine-go" style="animation-delay:${t0 + 3.4}s"><a class="p8-btn is-lock" href="certificate.html">View my certificate →</a><a class="p8-btn" href="desk.html">Go to My Trader Desk →</a></div>
    </div></div>`;
}

export function renderAlreadyGraduated(el, { onPractice }) {
  const a = alumni();
  el.innerHTML = `<div class="cap-intro">
    <div class="cap-kicker">ALUMNI ✦</div><h1 class="cap-h">You already graduated.</h1>
    <p class="cap-lead">Graduated ${new Date(a.graduatedAt).toLocaleDateString()}. Your desk keeps going.</p>
    <div class="cap-actions"><a class="p8-btn is-lock" href="certificate.html">View my certificate →</a><a class="p8-btn" href="desk.html">My Trader Desk →</a><button type="button" class="p8-btn cap-again">Run another capstone day (practice)</button></div>
  </div>`;
  el.querySelector('.cap-again').addEventListener('click', onPractice);
}

export { graduated, curriculumComplete, capstoneAttempts, saveCapstoneAttempt };
