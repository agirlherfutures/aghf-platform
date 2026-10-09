/**
 * capstone.js — A Girl & Her Futures™
 *
 * The graduation gate. Sits outside the 8 phases and 22 sections.
 * One trading day in 6 steps (shared/desk-walk.js), no hints, no indicator.
 * Scored on process, not profit: a valid loser passes, a lucky rule break doesn't.
 */
import { runDeskWalk, renderDeskReport, MAX_RISK } from './desk-walk.js';
import {
  scoreCapstone, saveCapstoneAttempt, capstoneAttempts, graduate, graduated, alumni,
  saveReflections, currentPlan, curriculumComplete, METHOD_VERSION,
} from './desk-core.js';
import { awardBadge, badges } from './phase-final.js';
import { loadRiskProfile } from './risk-core.js';
import { PHASES, inStructureTitle } from './curriculum-data.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
export const GRAD_BADGE = { id: 'p8-graduate', title: 'YOU’RE IN STRUCTURE', emoji: '🎓', phase: 'capstone' };
export const GRAD_GP = 1500;

export const PARTS = [
  ['STEP 1', 'Read the room', '4H'],
  ['STEP 2', 'Find the level', '1H'],
  ['STEP 3', 'Watch the open', '15M'],
  ['STEP 4', 'Mark the ICC', '1M'],
  ['STEP 5', 'Decide + risk', 'Your plan'],
  ['STEP 6', 'Outcome', 'Last'],
];

/** The days whose marks check out against the candles under the Phase 5 rules. */
export const CAPSTONE_DAYS = ['VALID_LOSS', 'VALID_WIN', 'VALID_LOSS_SHORT', 'VALID_PASS', 'NO_RETEST'];

const AREAS = {
  analysis: { label: 'Analysis', fix: [[1, 'How to Break Down a Trade'], [10, 'Full Top-to-Bottom Breakdown']] },
  execution: { label: 'Execution', fix: [[8, 'Right Analysis. Wrong Execution.'], [6, 'Why I Passed This Trade']] },
  risk: { label: 'Risk', fix: [[2, 'A Valid Winning Trade'], [8, 'Right Analysis. Wrong Execution.']] },
  management: { label: 'Management', fix: [[3, 'A Valid Losing Trade'], [7, 'The Missed Trade']] },
  ruleAdherence: { label: 'Rule adherence', fix: [[4, 'An Invalid Winning Trade'], [5, 'Clean vs Messy Setups']] },
  review: { label: 'Review', fix: [[3, 'A Valid Losing Trade'], [4, 'An Invalid Winning Trade']] },
};

// ── which day you get ────────────────────────────────────────────────────
/** First attempt is always the valid loser. Retries draw a different day at random. */
export function pickVariant(pool, forced) {
  if (forced) { const f = pool.find((p) => p.variant === forced); if (f) return f; }
  const tries = capstoneAttempts();
  if (!tries.length) return pool.find((p) => p.variant === 'VALID_LOSS') || pool[0];
  const last = tries[tries.length - 1].variant;
  const rest = pool.filter((p) => p.variant !== 'VALID_LOSS' && p.variant !== last);
  return rest[Math.floor(Math.random() * rest.length)] || pool[0];
}

// ── screens ───────────────────────────────────────────────────────────────
export function renderIntro(el, { name, onBegin, attempts = 0, practice = false }) {
  el.innerHTML = `<div class="cap-intro">
    <div class="cap-kicker">${practice ? 'PRACTICE DAY' : 'YOU’RE IN STRUCTURE CAPSTONE 🎓'}</div>
    <h1 class="cap-h">${name ? `${esc(name)}, break` : 'Break'} down one real trading day, the way Dayli does.</h1>
    <p class="cap-lead">You’ll go top-down, one timeframe at a time. The outcome stays hidden until the end, because this tests your process, not your luck.</p>
    <div class="cap-how">
      <div><i>1</i><b>Mark it</b><span>Each step tells you exactly what to tap on the chart.</span></div>
      <div><i>2</i><b>Answer one question</b><span>One at a time, about what you just marked.</span></div>
      <div><i>3</i><b>${practice ? 'See Dayli’s read' : 'Get your report'}</b><span>${practice ? 'After every step, your marks sit next to Dayli’s, with why.' : 'At the end, every mark you made sits next to Dayli’s, step by step.'}</span></div>
    </div>
    <div class="cap-parts">${PARTS.map(([p, t, tf]) => `<div class="cap-part"><span>${p}</span><b>${t}</b><em>${tf}</em></div>`).join('')}</div>
    <div class="cap-rules">
      <div><b>To pass</b>Follow your process. A valid loss passes. A lucky rule break doesn’t.</div>
      <div><b>The account</b>$50,000 evaluation · $${MAX_RISK} max risk per trade · MNQ is $2 per point.</div>
      <div><b>Allowed</b>Your Trading Plan, Rulebook and Risk Profile. They stay one tap away above the desk.</div>
    </div>
    ${attempts && !practice ? `<p class="cap-dim">Attempt ${attempts + 1}. This is a different day from the last one.</p>` : ''}
    <div class="cap-actions is-end"><button type="button" class="cap-btn cap-go">${practice ? 'Start the practice day →' : 'Begin the Capstone →'}</button></div>
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

export function runCapstone(el, item, onDone, { feedback = 'end' } = {}) {
  const it = { ...item, case: JSON.parse(JSON.stringify(item.case)) };
  runDeskWalk(el, it, { feedback, onDone: (res, c, rec, D) => onDone(res, c, rec, D) });
}

const TONE = { STRONG: 'is-strong', SOLID: 'is-solid', REVIEW: 'is-review' };
function scoreRows(res) {
  return Object.entries(AREAS).map(([k, a]) => `<div class="cap-row ${TONE[res.scores[k]]}"><span>${a.label}</span><b>${res.scores[k]}</b><em>${esc(res.notes[k])}</em></div>`).join('');
}
const OUT = { WIN: 'The trade won', LOSS: 'The trade lost', WOULD_HAVE_WON: 'It would have won', WOULD_HAVE_LOST: 'It would have lost', CHOP: 'Price chopped' };

export function renderResult(el, res, c, { onContinue, onRetry, rec, D, practice = false }) {
  const lossPass = res.pass && res.outcome === 'LOSS';
  const rows = Object.entries(res.rows || {}).flatMap(([step, rs]) => rs.map((r, i) => ({ step: i ? '' : step, ...r })));
  const matched = rows.filter((r) => r.ok).length;
  el.innerHTML = `<div class="cap-result">
    <div class="cap-kicker">${res.pass ? (practice ? 'PRACTICE DAY · PASSED ✓' : 'CAPSTONE PASSED ✓') : 'NOT YET · REVIEW NEEDED'}</div>
    <h2 class="cap-h2">${res.pass ? (lossPass ? 'Passed. Your process held, even though the trade lost.' : 'Passed. You traded your plan.') : 'Not yet. Here’s exactly what to sharpen.'}</h2>
    <p class="cap-lead">${res.pass ? 'The result is information. The process is what passed.' : 'This isn’t a fail. It’s a review. Your strengths stay yours, and the retry is a different day.'}</p>
    <div class="cap-score">
      <div><small>Reads matched</small><b>${matched} of ${rows.length}</b></div>
      <div><small>Rules</small><b>${res.crit.length ? 'Broken' : 'All held'}</b></div>
      <div><small>Decision</small><b>${esc(rec?.decision?.choice || '·')}</b></div>
      <div><small>Outcome</small><b>${esc(OUT[res.outcome] || res.outcome || '·')}</b></div>
    </div>
    <h3 class="cap-sub">STEP BY STEP · YOU VS DAYLI</h3>
    <div class="cap-tablewrap"><table class="cap-table"><thead><tr><th>Step</th><th>What</th><th>You</th><th>Dayli</th><th></th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td>${esc(r.step)}</td><td>${esc(r.label)}</td><td>${esc(r.you)}</td><td>${r.ok ? 'Same' : esc(r.dayli)}${!r.ok && r.why ? `<em>${esc(r.why)}</em>` : ''}</td><td class="${r.ok ? 'ok' : 'no'}">${r.ok ? '✓ Match' : 'Review'}</td></tr>`).join('')}
    </tbody></table></div>
    <h3 class="cap-sub">YOUR MARKS ON THE CHARTS</h3>
    <div class="cap-charts"></div>
    <h3 class="cap-sub">HOW YOU WERE SCORED</h3>
    <div class="cap-rows">${scoreRows(res)}</div>
    ${res.crit.length ? `<div class="cap-crit"><div class="cap-sub">CRITICAL</div>${res.crit.map((x) => `<div>✕ ${esc(x)}</div>`).join('')}</div>` : ''}
    ${res.pass ? '' : reviewPlan(res)}
    <div class="cap-actions is-end">${res.pass ? (practice ? '<a class="cap-btn" href="desk.html">Back to My Trader Desk →</a>' : '<button type="button" class="cap-btn cap-next">Last step: reflect →</button>') : '<a class="cap-btn ghost" href="desk.html">Practice on My Trader Desk</a><button type="button" class="cap-btn cap-retry">Retry with a new day →</button>'}</div>
  </div>`;
  if (rec && D) renderDeskReport(el.querySelector('.cap-charts'), c, rec, D);
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
    <div class="cap-kicker">REFLECT</div><h2 class="cap-h2">Before you walk out the door.</h2>
    <p class="cap-lead">Three answers. They go on your alumni profile, so future you can read them.</p>
    ${REFLECT_QS.map(([k, q]) => `<label class="cap-q">${q}<textarea rows="3" data-k="${k}" placeholder="In your own words…"></textarea></label>`).join('')}
    <div class="cap-actions is-end"><button type="button" class="cap-btn cap-save" disabled>Save + graduate 🎓</button></div>
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
    <div class="cap-actions is-end"><button type="button" class="cap-btn ghost cap-again">Run a practice day</button><a class="cap-btn ghost" href="desk.html">My Trader Desk</a><a class="cap-btn" href="certificate.html">View my certificate →</a></div>
  </div>`;
  el.querySelector('.cap-again').addEventListener('click', onPractice);
}

export { graduated, curriculumComplete, capstoneAttempts, saveCapstoneAttempt };
