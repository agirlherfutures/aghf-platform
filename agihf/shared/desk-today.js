/**
 * desk-today.js — A Girl & Her Futures™
 * My Trader Desk, in four rooms: Today · Practice · Journal · Review.
 *
 *   Today     one plan for the day, this week's focus, plain-word stats.
 *   Practice  pick what to practice: a full top-down day (the Capstone desk,
 *             with Dayli's read after every step), replay reps, a backtest
 *             study, or Strategy 2 (Supply & Demand) once Phase 5 is done.
 *   Journal / Review reuse the existing tools (shared/desk.js), restyled light.
 *
 * Which strategy you're practicing is a per-browser preference.
 */
import {
  journalEntries, currentFocus, currentPlan, weeklyReviews, weekBounds, within, saveRep, academyStatus,
} from './desk-core.js';
import { runCapstone, renderResult, CAPSTONE_DAYS } from './capstone.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const PRACTICE = ['BACKTEST', 'REPLAY'];
const KEY = 'aghf_desk_strategy';
export function strategy() { try { return localStorage.getItem(KEY) === 'sd' ? 'sd' : 'icc'; } catch { return 'icc'; } }
export function setStrategy(v) { try { localStorage.setItem(KEY, v); } catch { /* private mode */ } }

const STRAT = {
  icc: { label: 'Dayli ICC', tag: 'Strategy 1' },
  sd: { label: 'Supply & Demand', tag: 'Strategy 2 · Optional' },
};

/** The switch at the top of the desk: the bridge between the two strategies. */
export function strategySwitch(sdUnlocked) {
  const cur = strategy();
  return `<div class="dt-switch" role="group" aria-label="Strategy you're practicing"><span>Practicing:</span>
    <button type="button" class="dt-chip${cur === 'icc' ? ' on' : ''}" data-strat="icc">Dayli ICC</button>
    <button type="button" class="dt-chip${cur === 'sd' ? ' on' : ''}${sdUnlocked ? '' : ' is-locked'}" data-strat="sd" ${sdUnlocked ? '' : 'title="Unlocks after Phase 5"'}>${sdUnlocked ? '' : '🔒 '}Supply &amp; Demand</button></div>`;
}

// ── Today ────────────────────────────────────────────────────────────────
export function renderToday(el, { name = '', sdUnlocked = false } = {}) {
  const all = journalEntries();
  const { from } = weekBounds();
  const week = within(all, from, Date.now() + 1);
  const dayStart = new Date().setHours(0, 0, 0, 0);
  const practiceWeek = week.filter((e) => PRACTICE.includes(e.entrySource));
  const repsToday = all.filter((e) => PRACTICE.includes(e.entrySource) && (e.createdAt || 0) >= dayStart).length;
  const loggedToday = all.some((e) => (e.createdAt || 0) >= dayStart && (e.studentLesson || e.note || e.notes));
  const plan = currentPlan();
  const focus = currentFocus();
  const lastW = weeklyReviews().slice(-1)[0];
  const reviewedThisWeek = lastW && (lastW.savedAt || 0) >= from;
  const matched = practiceWeek.filter((e) => e.matchedOf);
  const matchPct = matched.length ? Math.round(matched.reduce((s, e) => s + e.matched / e.matchedOf, 0) / matched.length * 100) : null;
  const followed = practiceWeek.filter((e) => !(e.violations || []).length).length;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const st = strategy();
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const status = academyStatus();

  const steps = [
    plan
      ? { done: true, t: 'Check your Trading Plan', s: `v${esc(plan.version)} is locked. Nothing to change mid-week.`, href: '#review/plan' }
      : { done: false, t: 'Build your Trading Plan', s: 'It pulls in your Rulebook and Risk Profile. You review it and lock it.', href: '#review/plan' },
    { done: repsToday >= 5, t: `Do 5 practice reps${repsToday ? ` · ${Math.min(repsToday, 5)} of 5 done` : ''}`, s: st === 'sd' ? 'Supply & Demand: mark the zone, wait for price to return, decide at the edge.' : 'Dayli ICC: one full day, top-down. You see Dayli’s read after every step.', href: '#practice' },
    { done: loggedToday, t: 'Write one line in your journal', s: 'What you did well, and the one thing you’d tighten.', href: '#journal' },
  ];
  const tile = (label, value, sub, empty) => `<div class="dt-stat${empty ? ' is-empty' : ''}"><small>${label}</small><b>${value}</b><em>${sub}</em></div>`;
  el.innerHTML = `<div class="dt">
    <div class="dt-eyebrow">My Trader Desk · ${esc(day)}</div>
    <h2 class="dt-title">${greet}${name ? `, ${esc(name)}` : ''}. Here’s today.</h2>
    ${status === 'CAPSTONE READY' ? '<a class="dt-banner" href="capstone.html"><b>🎓 Your Capstone is ready.</b><span>Break down one trading day, the way Dayli does →</span></a>' : ''}
    <div class="dt-today">
      <div class="dt-plan"><h3>Today’s plan · about 20 minutes</h3>
        <ol>${steps.map((s, i) => `<li class="${s.done ? 'done' : ''}"><a href="${s.href}"><span class="n">${s.done ? '✓' : i + 1}</span><span><b>${s.t}</b><em>${s.s}</em></span></a></li>`).join('')}</ol>
      </div>
      <div class="dt-focus"><span class="k">This week’s focus</span>
        ${focus
          ? `<span class="big">${esc(focus.primary)}</span>${focus.measure ? `<small>${esc(focus.measure)}</small>` : ''}<div class="dt-bar" aria-hidden="true"><i style="width:${Math.min(100, practiceWeek.length * 10)}%"></i></div><small><b>${practiceWeek.length}</b> practice rep${practiceWeek.length === 1 ? '' : 's'} this week. Aim for 10.</small>`
          : '<span class="big">Pick one thing to work on.</span><small>Your weekly review looks at your journal and suggests one focus. It then shows up here all week.</small><a class="dt-link" href="#review/weekly">Do your weekly review →</a>'}
      </div>
    </div>
    <div class="dt-stats">
      ${tile('Practice reps this week', practiceWeek.length, practiceWeek.length ? 'Goal: 15' : 'Do your first rep to start the count', !practiceWeek.length)}
      ${practiceWeek.length >= 3 ? tile('Followed every rule', `${Math.round(followed / practiceWeek.length * 100)}%`, `${followed} of ${practiceWeek.length} reps`) : tile('Followed every rule', 'After 3 reps', 'This fills in once there’s enough to count', true)}
      ${matchPct != null ? tile('Matched Dayli’s read', `${matchPct}%`, `Across ${matched.length} full day${matched.length === 1 ? '' : 's'}`) : tile('Matched Dayli’s read', 'After a full day', 'Do a top-down practice day to see this', true)}
      ${tile('Weekly review', reviewedThisWeek ? 'Done ✓' : 'Due Sunday', reviewedThisWeek ? 'See you next week' : 'Takes about 5 minutes', !reviewedThisWeek)}
    </div>
    <div class="dt-act"><span class="dt-hint">${practiceWeek.length ? 'Practice first, then journal, then review on Sunday.' : 'New here? Start with one practice day. Everything else fills in from there.'}</span><a class="dt-btn" href="#practice">${repsToday ? 'Keep practicing →' : 'Start practicing →'}</a></div>
  </div>`;
}

// ── Practice picker ──────────────────────────────────────────────────────
export function renderPracticePicker(el, { sdUnlocked = false } = {}) {
  const st = strategy();
  const cards = [
    { k: 'day', tag: 'Strategy 1 · Dayli ICC', cls: '', h: 'Top-down practice day', p: '4H room → 1H level → 15M → 1M Indication, Correction, Continuation → decide and set risk. Dayli’s read after every step.', meta: '1 day · ~12 min', href: '#practice/day' },
    { k: 'replay', tag: 'Strategy 1 · Dayli ICC', cls: '', h: 'Replay reps', p: 'Play a recreated session candle by candle and decide with only what has printed. Each rep goes into your journal.', meta: '10 reps · ~20 min', href: '#practice/replay' },
    sdUnlocked
      ? { k: 'sd', tag: 'Strategy 2 · Supply & Demand', cls: 'p', h: 'Zone practice', p: 'Find the zone-forming candle, set its edges, then play price back into it and decide.', meta: 'Zone Builder + Execution Lab', href: 'strategy-lab-lesson.html?id=execution-lab' }
      : { k: 'sd', tag: 'Strategy 2 · Optional', cls: 'k', h: 'Supply & Demand', p: 'Unlocks after Phase 5. It runs on the same steps as ICC; only the trigger changes, from the PIL to the zone.', meta: '🔒 Finish Phase 5', href: null },
    { k: 'study', tag: 'Research', cls: 'g', h: 'Backtest study', p: 'Lock one set of rules, run 20 reps without Dayli’s answers, and see what your own data says.', meta: '20 reps · over a few days', href: '#practice/backtest' },
  ];
  if (st === 'sd' && sdUnlocked) cards.unshift(cards.splice(2, 1)[0]);
  el.innerHTML = `<div class="dt">
    <div class="dt-eyebrow">Practice</div>
    <h2 class="dt-title">What do you want to practice?</h2>
    <p class="dt-lede">Every practice rep goes into your journal automatically. Pick one and follow the steps on screen.</p>
    <div class="dt-picks">${cards.map((c) => (c.href
      ? `<a class="dt-pick" href="${c.href}"><span class="tag ${c.cls}">${c.tag}</span><h3>${c.h}</h3><p>${c.p}</p><span class="meta">${c.meta}</span></a>`
      : `<div class="dt-pick is-locked"><span class="tag ${c.cls}">${c.tag}</span><h3>${c.h}</h3><p>${c.p}</p><span class="meta">${c.meta}</span></div>`)).join('')}</div>
    <div class="dt-bridge"><b>How the two strategies connect:</b> both use the same steps (read the room → find your level → wait for your trigger → decide → set risk). Dayli ICC triggers at the PIL. Supply &amp; Demand triggers at the zone.</div>
    <div class="dt-act"><a class="dt-btn ghost" href="#today">← Today</a><a class="dt-btn" href="${cards[0].href || '#practice/day'}">Start: ${esc(cards[0].href ? cards[0].h : 'Top-down practice day')} →</a></div>
  </div>`;
}

// ── A full top-down practice day (the Capstone desk, feedback after every step) ──
export async function runPracticeDay(el) {
  el.innerHTML = '<div class="dt"><p class="dt-lede">Loading a trading day…</p></div>';
  let pool = [];
  try { pool = (await (await fetch('lessons-data/p8-capstone.json')).json()).pool.filter((p) => CAPSTONE_DAYS.includes(p.variant)); } catch { /* offline */ }
  if (!pool.length) { el.innerHTML = '<div class="dt"><p class="dt-lede">Couldn’t load a practice day. Refresh to try again.</p></div>'; return; }
  let last = null; try { last = sessionStorage.getItem('aghf_desk_lastday'); } catch { /* */ }
  const choices = pool.filter((p) => p.variant !== last);
  const item = choices[Math.floor(Math.random() * choices.length)] || pool[0];
  try { sessionStorage.setItem('aghf_desk_lastday', item.variant); } catch { /* */ }
  runCapstone(el, item, (res, c, rec, D) => {
    const rows = Object.values(res.rows || {}).flat();
    const d = rec.decision || {};
    const took = d.choice === 'TAKE';
    const o = c.outcome || {};
    saveRep({
      entrySource: 'REPLAY', strategy: 'ICC', kind: 'FULL_DAY', caseId: c.id, date: c.historicalDate, instrument: c.instrument || 'MNQ', session: c.session,
      direction: c.dir === 'short' ? 'short' : 'long', decision: d.choice, outcome: took ? (o.type === 'WIN' ? 'WIN' : o.type === 'LOSS' ? 'LOSS' : 'BE') : 'NO_TRADE',
      realizedR: took ? o.r : null, entry: d.entry, stop: d.stop, target: d.target, contracts: d.contracts,
      setupQuality: rec.pregrade || null, ruleAdherence: !res.critical.length,
      violations: res.critical.length ? [{ tag: took && c.expert?.idealDecision !== 'TAKE' ? 'EARLY ENTRY' : 'RISK', category: 'ENTRY' }] : [],
      matched: rows.filter((r) => r.ok).length, matchedOf: rows.length, pass: res.pass,
    });
    renderResult(el, res, c, { rec, D, practice: true, onRetry: () => runPracticeDay(el), onContinue: () => {} });
    const act = el.querySelector('.cap-actions');
    if (act) act.innerHTML = '<a class="cap-btn ghost" href="#journal">See it in my journal</a><button type="button" class="cap-btn dt-again">Another practice day →</button>';
    el.querySelector('.dt-again')?.addEventListener('click', () => { runPracticeDay(el); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, { feedback: 'now' });
}
