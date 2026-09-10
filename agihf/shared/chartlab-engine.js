/**
 * chartlab-engine.js — A Girl & Her Futures™ (client-safe render layer)
 *
 * Presentation for AGHF Chart Lab: the home page (Today's Drill, Current
 * Focus connection, Continue Practicing, Browse by Skill, Progress
 * Snapshot), the drill player (Observe → Answer → Reveal → Learn →
 * Continue), all 6 implemented interaction types, the results screen, and
 * mistake review. Follows the same conventions proven throughout this
 * project (challenge-engine.js, wins-engine.js): `container.innerHTML =`
 * + event delegation, an `escapeHtml` helper, copy imported from
 * chartlab-copy.js so this file stays copy-free.
 *
 * The chart-tap interaction (canvas + nearest-zone hit-test, scaled
 * coordinates, accessible button fallback where the drill type allows
 * one) is the same proven technique already shipped in loop-engine.js's
 * renderClickChart — reimplemented here against Chart Lab's own
 * normalized-0-1-coordinate data shape (needed for image-resolution
 * independence) rather than cross-importing a function tightly coupled
 * to a different page's wizard chrome.
 */

import {
  SKILL_CATEGORIES, skillLabel, skillIcon, DIFFICULTY_LABELS, DRILL_TYPE_LABELS,
  MASTERY_COPY, RESULT_COPY, EMPTY_STATES, SESSION_TYPE_LABELS, REPORT_REASONS,
} from './chartlab-copy.js';
import { resolveChartImageUrl } from './chartlab-service.js';

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function emptyCard(icon, heading, body) {
  return `<div class="cl2-empty">
    <div class="cl2-empty-icon" aria-hidden="true">${icon}</div>
    <div class="cl2-empty-heading">${escapeHtml(heading)}</div>
    <p class="cl2-empty-body">${escapeHtml(body)}</p>
  </div>`;
}

function difficultyBadge(difficulty) {
  const meta = DIFFICULTY_LABELS[difficulty] || DIFFICULTY_LABELS.foundation;
  return `<span class="cl2-badge cl2-badge-${difficulty}">${escapeHtml(meta.label)}</span>`;
}

/* ══════════════════════════════ HOME PAGE ══════════════════════════════ */

export function renderTodaysDrillCard(container, drill, reason) {
  if (!drill) { container.innerHTML = emptyCard('✦', EMPTY_STATES.noTodaysDrill.heading, EMPTY_STATES.noTodaysDrill.body); return; }
  const typeMeta = DRILL_TYPE_LABELS[drill.drillType] || {};
  container.innerHTML = `<div class="cl2-hero">
    <div class="cl2-hero-eyebrow">✦ Today's Drill</div>
    <h2 class="cl2-hero-title">${escapeHtml(drill.title)}</h2>
    <p class="cl2-hero-body">${escapeHtml(drill.description || typeMeta.instruction || '')}</p>
    <div class="cl2-hero-meta">
      ${difficultyBadge(drill.difficulty)}
      <span class="cl2-hero-meta-item">${Math.max(1, Math.round((drill.estimatedSeconds || 60) / 60))} min</span>
      <span class="cl2-hero-meta-item">${skillIcon(drill.skillCategory)} ${escapeHtml(skillLabel(drill.skillCategory))}</span>
    </div>
    ${reason ? `<p class="small-help cl2-reason">${escapeHtml(reason)}</p>` : ''}
    <button type="button" class="dd-primary-btn" id="cl2StartTodays">Start Today's Drill</button>
  </div>`;
}

export function renderContinuePracticingCard(container, session) {
  if (!session) { container.innerHTML = ''; return; }
  const meta = SESSION_TYPE_LABELS[session.sessionType] || SESSION_TYPE_LABELS.daily;
  const total = (session.drillIds || session.drill_ids || []).length;
  const pos = session.currentPosition ?? session.current_position ?? 0;
  container.innerHTML = `<div class="dd-card cl2-continue-card">
    <div class="cl2-section-heading">Continue Practicing</div>
    <p class="small-help">${escapeHtml(meta.label)} — question ${Math.min(pos + 1, total)} of ${total}</p>
    <button type="button" class="dd-secondary-btn" id="cl2Continue">Continue</button>
  </div>`;
}

export function renderBrowseBySkill(container, onSelect) {
  container.innerHTML = `<div class="cl2-skill-grid">
    ${SKILL_CATEGORIES.map((s) => `<button type="button" class="cl2-skill-tile" data-skill="${s.key}">
      <span class="cl2-skill-icon" aria-hidden="true">${s.icon}</span>
      <span class="cl2-skill-label">${escapeHtml(s.label)}</span>
    </button>`).join('')}
  </div>`;
  container.querySelectorAll('[data-skill]').forEach((btn) => btn.addEventListener('click', () => onSelect(btn.dataset.skill)));
}

export function renderProgressSnapshot(container, { mastery = [], drillsCompleted = 0, gpEarned = 0, accuracyTrend = null }) {
  const improving = mastery.filter((m) => m.mastery_state === 'developing' || m.mastery_state === 'confident').slice(0, 3);
  container.innerHTML = `<div class="dd-card">
    <div class="cl2-section-heading">Progress Snapshot</div>
    <div class="cl2-snapshot-row">
      <div class="cl2-snapshot-stat"><span class="cl2-snapshot-num">${drillsCompleted}</span><span class="cl2-snapshot-label">Drills Completed</span></div>
      <div class="cl2-snapshot-stat"><span class="cl2-snapshot-num">${gpEarned}</span><span class="cl2-snapshot-label">GP Earned</span></div>
      <div class="cl2-snapshot-stat"><span class="cl2-snapshot-num">${accuracyTrend != null ? accuracyTrend + '%' : '—'}</span><span class="cl2-snapshot-label">Recent Accuracy</span></div>
    </div>
    ${improving.length ? `<p class="small-help">Improving: ${improving.map((m) => escapeHtml(skillLabel(m.skill_category))).join(', ')}</p>` : ''}
  </div>`;
}

export function renderSessionPicker(container, onPick) {
  container.innerHTML = `<div class="cl2-session-row">
    ${Object.entries(SESSION_TYPE_LABELS).filter(([k]) => k !== 'full_breakdown').map(([key, meta]) => `
      <button type="button" class="dd-secondary-btn cl2-session-btn" data-session-type="${key}">
        <strong>${escapeHtml(meta.label)}</strong><span class="small-help">${escapeHtml(meta.description)}</span>
      </button>
    `).join('')}
  </div>`;
  container.querySelectorAll('[data-session-type]').forEach((btn) => btn.addEventListener('click', () => onPick(btn.dataset.sessionType)));
}

/* ═══════════════════════════ DRILL PLAYER ══════════════════════════════ */

function loadImage(url) {
  return new Promise((resolve, reject) => {
    if (!url) return reject(new Error('No chart image'));
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Renders the full Observe→Answer stage for one drill and wires
 * submission. `onSubmit(memberAnswer, hintsUsed)` is called once the
 * member has answered and pressed Submit — scoring itself always happens
 * server-side (or in the demo fixture), never trusted from here. */
export async function renderDrillPlayer(container, drill, answerKeyPreview, helpers) {
  const typeMeta = DRILL_TYPE_LABELS[drill.drillType] || {};
  let hintsUsed = 0;
  let hintIndex = 0;
  const hints = answerKeyPreview.hints || [];

  container.innerHTML = `
    <div class="dd-card cl2-player-card">
      <div class="cl2-player-top">
        ${difficultyBadge(drill.difficulty)}
        <span class="cl2-hero-meta-item">${skillIcon(drill.skillCategory)} ${escapeHtml(skillLabel(drill.skillCategory))}</span>
        <button type="button" class="cl2-report-link" id="cl2ReportBtn">Report This Drill</button>
      </div>
      <h2 class="cl2-question">${escapeHtml(drill.question)}</h2>
      <p class="small-help cl2-instruction">${escapeHtml(typeMeta.instruction || '')}</p>
      <div class="cl2-chart-wrap" id="cl2ChartWrap">
        <div class="cl2-chart-loading">Loading chart…</div>
      </div>
      <div id="cl2InteractionArea"></div>
      <div class="cl2-hint-row">
        ${hints.length ? '<button type="button" class="cl2-hint-btn" id="cl2HintBtn">💡 Need a hint?</button>' : ''}
        <div id="cl2HintText" class="small-help"></div>
      </div>
      <div class="cl2-submit-row">
        <button type="button" class="dd-primary-btn" id="cl2SubmitBtn" disabled>Submit Answer</button>
      </div>
    </div>
    <div id="cl2ReportPanel" hidden class="dd-card cl2-report-panel"></div>
  `;

  const chartWrap = document.getElementById('cl2ChartWrap');
  const interactionArea = document.getElementById('cl2InteractionArea');
  const submitBtn = document.getElementById('cl2SubmitBtn');
  const hintBtn = document.getElementById('cl2HintBtn');
  const hintText = document.getElementById('cl2HintText');

  hintBtn?.addEventListener('click', () => {
    hintText.textContent = hints[hintIndex];
    hintsUsed = hintIndex + 1;
    hintIndex = Math.min(hintIndex + 1, hints.length - 1);
    if (hintIndex >= hints.length - 1) hintBtn.disabled = true;
  });

  document.getElementById('cl2ReportBtn').addEventListener('click', () => {
    const panel = document.getElementById('cl2ReportPanel');
    panel.hidden = !panel.hidden;
    if (!panel.hidden) {
      panel.innerHTML = `
        <label class="field-label">What's wrong with this drill?</label>
        <select class="field-input" id="cl2ReportReason">${REPORT_REASONS.map((r) => `<option>${escapeHtml(r)}</option>`).join('')}</select>
        <textarea class="field-textarea" id="cl2ReportDesc" placeholder="Anything else? (optional)"></textarea>
        <button type="button" class="dd-secondary-btn" id="cl2ReportSubmit">Send Report</button>
      `;
      document.getElementById('cl2ReportSubmit').addEventListener('click', async () => {
        await helpers.onReport(document.getElementById('cl2ReportReason').value, document.getElementById('cl2ReportDesc').value);
        panel.innerHTML = '<p class="small-help">Thanks — the AGHF team will take a look.</p>';
      });
    }
  });

  let memberAnswer = null;
  function setAnswer(a) { memberAnswer = a; submitBtn.disabled = false; }

  // ── Chart canvas (shared by every drill type that shows one) ──────────
  const canvas = document.createElement('canvas');
  canvas.width = 780; canvas.height = 320; canvas.className = 'cl2-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', drill.chartAltText || 'Trading chart for this drill');
  chartWrap.innerHTML = '';
  chartWrap.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let img = null;
  try {
    const url = await resolveChartImageUrl(drill);
    img = await loadImage(url);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } catch {
    ctx.fillStyle = '#FFFBF9'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#7A5C50'; ctx.font = '14px sans-serif'; ctx.fillText('Chart image unavailable', 20, 30);
  }

  function redrawWithMarker(point) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (img) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    if (point) {
      ctx.beginPath();
      ctx.arc(point.x * canvas.width, point.y * canvas.height, 10, 0, Math.PI * 2);
      ctx.strokeStyle = '#F4829A'; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath();
      ctx.arc(point.x * canvas.width, point.y * canvas.height, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#F4829A'; ctx.fill();
    }
  }

  if (drill.drillType === 'spot_it' || drill.drillType === 'mark_the_chart') {
    canvas.style.cursor = 'crosshair';
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const point = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
      redrawWithMarker(point);
      setAnswer({ point });
    });
    interactionArea.innerHTML = `<p class="small-help">Tap directly on the chart above to mark your answer.</p>`;
  } else if (drill.drillType === 'sequence_builder') {
    const pool = [...answerKeyPreview.choices].sort(() => Math.random() - 0.5);
    const built = [];
    interactionArea.innerHTML = `
      <div class="cl2-seq-built" id="cl2SeqBuilt"></div>
      <div class="cl2-seq-pool" id="cl2SeqPool">${pool.map((c) => `<button type="button" class="cl2-seq-chip" data-key="${c.key}">${escapeHtml(c.label)}</button>`).join('')}</div>
      <button type="button" class="cl2-hint-btn" id="cl2SeqReset">↻ Reset</button>
    `;
    const builtEl = document.getElementById('cl2SeqBuilt');
    const poolEl = document.getElementById('cl2SeqPool');
    function renderSeq() {
      builtEl.innerHTML = built.length
        ? built.map((k, i) => `<span class="cl2-seq-slot">${i + 1}. ${escapeHtml(pool.find((p) => p.key === k)?.label || k)}</span>`).join('')
        : '<span class="small-help">Tap items below in order.</span>';
      poolEl.querySelectorAll('.cl2-seq-chip').forEach((chip) => { chip.disabled = built.includes(chip.dataset.key); });
      if (built.length === pool.length) setAnswer({ sequence: built });
    }
    poolEl.querySelectorAll('.cl2-seq-chip').forEach((chip) => chip.addEventListener('click', () => { built.push(chip.dataset.key); renderSeq(); }));
    document.getElementById('cl2SeqReset').addEventListener('click', () => { built.length = 0; submitBtn.disabled = true; renderSeq(); });
    renderSeq();
  } else {
    // choice-based: valid_invalid / phase_id / candle_close_wick / best_decision / full_breakdown
    interactionArea.innerHTML = `<div class="cl2-choice-row">${answerKeyPreview.choices.map((c) => `<button type="button" class="cl2-choice-btn" data-key="${c.key}">${escapeHtml(c.label)}</button>`).join('')}</div>`;
    interactionArea.querySelectorAll('.cl2-choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        interactionArea.querySelectorAll('.cl2-choice-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        setAnswer({ choice: btn.dataset.key });
      });
    });
  }

  submitBtn.addEventListener('click', () => helpers.onSubmit(memberAnswer, hintsUsed));
}

/* ═══════════════════════════ RESULTS / REVEAL ══════════════════════════ */

export function renderRevealScreen(container, attemptResult, drill, helpers) {
  const resultMeta = RESULT_COPY[attemptResult.result] || RESULT_COPY.review_needed;
  const reveal = attemptResult.reveal;
  const toneClass = attemptResult.result === 'correct' ? 'good' : attemptResult.result === 'partial' ? 'watch' : 'neutral';

  let answerSummary = '';
  if (reveal.answerType === 'choice') {
    const correct = reveal.choices.find((c) => c.key === reveal.correctChoice);
    answerSummary = `<p class="cl2-answer-line"><strong>Correct answer:</strong> ${escapeHtml(correct?.label || reveal.correctChoice)}</p>`;
  } else if (reveal.answerType === 'sequence') {
    answerSummary = `<p class="cl2-answer-line"><strong>Correct order:</strong> ${reveal.correctSequence.map((k) => escapeHtml(reveal.choices.find((c) => c.key === k)?.label || k)).join(' → ')}</p>`;
  } else if (reveal.answerType === 'point' || reveal.answerType === 'zone') {
    answerSummary = `<p class="cl2-answer-line">The correct area is now marked on the chart above.</p>`;
  }

  container.innerHTML = `
    <div class="dd-card cl2-reveal-card cl2-tone-${toneClass}">
      <div class="cl2-reveal-badge">${resultMeta.icon} ${escapeHtml(resultMeta.label)}</div>
      ${answerSummary}
      <div class="cl2-explanation">
        <strong>Why:</strong> ${escapeHtml(reveal.explanation)}
      </div>
      ${reveal.commonMistake ? `<p class="small-help"><strong>Common mistake:</strong> ${escapeHtml(reveal.commonMistake)}</p>` : ''}
      ${reveal.relatedRule ? `<p class="small-help cl2-rule">✦ ${escapeHtml(reveal.relatedRule)}</p>` : ''}
      ${attemptResult.gpAwarded > 0 ? `<div class="cl2-gp-line">+${attemptResult.gpAwarded} GP</div>` : ''}
      ${attemptResult.masteryLeveledUp ? `<div class="cl2-mastery-up">Your mastery in ${escapeHtml(skillLabel(drill.skillCategory))} just moved to ${escapeHtml((MASTERY_COPY[attemptResult.masteryState] || {}).label || attemptResult.masteryState)}.</div>` : ''}
      <div class="cl2-reveal-actions">
        <button type="button" class="dd-primary-btn" id="cl2NextBtn">${helpers.hasNext ? 'Next Question' : 'Continue Practicing'}</button>
        ${attemptResult.result !== 'correct' ? '<button type="button" class="dd-secondary-btn" id="cl2AskAgentBtn">Ask AGHF Agent</button>' : '<button type="button" class="dd-secondary-btn" id="cl2SaveBtn">Save to My Playbook</button>'}
        ${drill.lessonKey ? '<a class="dd-secondary-btn" id="cl2LessonLink" href="#">Review the Lesson</a>' : ''}
      </div>
    </div>
  `;

  document.getElementById('cl2NextBtn').addEventListener('click', helpers.onNext);
  document.getElementById('cl2AskAgentBtn')?.addEventListener('click', () => helpers.onAskAgent(reveal));
  document.getElementById('cl2SaveBtn')?.addEventListener('click', helpers.onSaveToPlaybook);
  const lessonLink = document.getElementById('cl2LessonLink');
  if (lessonLink) {
    const [phase, n] = String(drill.lessonKey).split('-');
    lessonLink.href = `lesson.html?phase=${phase}&n=${n}`;
  }
}

/* ═══════════════════════════ SESSION RESULTS ═══════════════════════════ */

export function renderSessionResults(container, summary, helpers) {
  container.innerHTML = `
    <div class="dd-card cl2-session-results">
      <div class="cl2-section-heading">Drill Complete</div>
      <div class="cl2-snapshot-row">
        <div class="cl2-snapshot-stat"><span class="cl2-snapshot-num">${summary.completed}</span><span class="cl2-snapshot-label">Completed</span></div>
        <div class="cl2-snapshot-stat"><span class="cl2-snapshot-num">${summary.correct}</span><span class="cl2-snapshot-label">Correct</span></div>
        <div class="cl2-snapshot-stat"><span class="cl2-snapshot-num">${summary.partial}</span><span class="cl2-snapshot-label">Partial</span></div>
        <div class="cl2-snapshot-stat"><span class="cl2-snapshot-num">${summary.reviewNeeded}</span><span class="cl2-snapshot-label">Review Needed</span></div>
      </div>
      <p class="cl2-session-summary">${escapeHtml(summary.summaryLine)}</p>
      <div class="cl2-gp-line">+${summary.gpEarned} GP earned this session</div>
      <div class="cl2-reveal-actions">
        <button type="button" class="dd-primary-btn" id="cl2ContinuePracticing">Continue Practicing</button>
        ${summary.reviewNeeded > 0 ? '<button type="button" class="dd-secondary-btn" id="cl2ReviewMistakes">Review Mistakes</button>' : ''}
        <a class="dd-secondary-btn" href="chart-lab.html">Return to Chart Lab</a>
      </div>
    </div>
  `;
  document.getElementById('cl2ContinuePracticing').addEventListener('click', helpers.onContinue);
  document.getElementById('cl2ReviewMistakes')?.addEventListener('click', helpers.onReviewMistakes);
}

/* ═══════════════════════════ MISTAKE REVIEW ════════════════════════════ */

export function renderMistakeReview(container, mistakes, onRetry) {
  if (!mistakes.length) { container.innerHTML = emptyCard('✦', EMPTY_STATES.noMistakes.heading, EMPTY_STATES.noMistakes.body); return; }
  container.innerHTML = `<div class="cl2-mistake-list">
    ${mistakes.map((m) => `<div class="cl2-mistake-row" data-drill-id="${m.drillId}">
      <span class="cl2-mistake-title">${escapeHtml(m.title)}</span>
      <span class="cl2-hero-meta-item">${skillIcon(m.skillCategory)} ${escapeHtml(skillLabel(m.skillCategory))}</span>
      <span class="cl2-badge">${escapeHtml((RESULT_COPY[m.result] || {}).label || m.result)}</span>
      <button type="button" class="cl2-hint-btn" data-retry="${m.drillId}">Try Again</button>
    </div>`).join('')}
  </div>`;
  container.querySelectorAll('[data-retry]').forEach((btn) => btn.addEventListener('click', () => onRetry(btn.dataset.retry)));
}
