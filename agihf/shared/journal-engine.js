/**
 * journal-engine.js — A Girl & Her Futures™
 *
 * Render layer for the AG&HF Trade Journal entry page. Organized into 4
 * visible stages (Trade → Execution → Mindset → Reflection) switched by
 * tabs, matching the ADHD-friendly "one stage at a time, progress always
 * visible" requirement — every stage's answers persist when you switch
 * away, nothing resets. Field content per stage is trimmed to exactly
 * what preview.html's Trade Journal showed; navigation is a wizard —
 * "Next →" advances through the stages, ending in one explicit "✦ Save
 * Entry" button on the last stage (Reflection), instead of a save action
 * repeated identically on every stage.
 *
 * This is also where the P&L math preview.html got wrong is fixed:
 * `computeTradeTotals()` uses direction-aware points (long = exit -
 * entry, short = entry - exit), a real per-instrument point value from
 * instrument-data.js (user-overridable via "Point Value Per Contract",
 * matching preview.html's editable default-2 field) instead of a hidden
 * $2 default, and validates scale-out contracts never exceed the
 * original position size.
 */

import { getInstrument, INSTRUMENT_SYMBOLS } from './instrument-data.js';
import { showDeskToast } from './dayli-desk-engine.js';

const STAGES = ['trade', 'execution', 'mindset', 'reflection'];
const STAGE_LABELS = { trade: 'Trade', execution: 'Execution', mindset: 'Mindset', reflection: 'Reflection' };

const EMOTION_OPTIONS = {
  entering: ['Calm', 'Observant', 'Confident', 'Rushed', 'Unsure'],
  during: ['Focused', 'Present', 'In Flow', 'Tense', 'Impatient'],
  exiting: ['Satisfied', 'Clear', 'Encouraged', 'Frustrated', 'Unsure'],
};

const SESSIONS = ['Asia', 'London', 'NY AM', 'NY Lunch', 'NY PM'];

/**
 * Corrected long/short scale-out math — the concrete bug fix from
 * preview.html, which computed `exit - entry` for every trade regardless
 * of direction (wrong for profitable shorts). Point value prefers an
 * explicit manual override (preview.html's editable "Point Value Per
 * Contract" field) over the selected instrument's default, so a member
 * can still correct it the same way preview.html allowed.
 * @param {import('./dashboard-models.js').JournalEntryRecord} entry
 */
export function computeTradeTotals(entry) {
  const instrument = getInstrument(entry.instrument);
  const pointValue = entry.manualPointValue != null && entry.manualPointValue !== ''
    ? Number(entry.manualPointValue)
    : (instrument ? instrument.pointValue : null);
  const entryPrice = entry.entryPrice;
  const direction = entry.direction;
  const exits = entry.exits || [];

  let totalContracts = 0;
  let weightedPoints = 0;
  let grossPnl = 0;
  const computedExits = exits.map((ex) => {
    const contracts = Number(ex.contracts) || 0;
    const exitPrice = ex.exitPrice != null ? Number(ex.exitPrice) : null;
    if (entryPrice == null || exitPrice == null || !contracts || !direction || pointValue == null) {
      return { ...ex, points: null, dollars: null };
    }
    const points = direction === 'long' ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
    const dollars = points * pointValue * contracts;
    totalContracts += contracts;
    weightedPoints += points * contracts;
    grossPnl += dollars;
    return { ...ex, points, dollars };
  });

  const exceedsPosition = entry.contracts != null && totalContracts > entry.contracts;
  const netPnl = grossPnl - (Number(entry.fees) || 0);

  return { computedExits, totalContracts, exceedsPosition, weightedPoints, grossPnl, netPnl, pointValue };
}

export function computeOutcome(netPnl) {
  if (netPnl == null) return null;
  if (netPnl > 0) return 'win';
  if (netPnl < 0) return 'loss';
  return 'breakeven';
}

function fmt(n) { return Number.isFinite(n) ? n.toFixed(2) : ''; }
function fmtMoney(n) { return Number.isFinite(n) ? `${n < 0 ? '−' : ''}$${Math.abs(n).toFixed(2)}` : ''; }

/** TradeDetailsForm — matches preview.html's Trade Details section exactly. */
function renderTradeDetailsForm(entry) {
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-pink">🧾</div><div><div class="section-title">Trade Details</div><div class="section-sub">Who, what, when, where</div></div></div>
      <div class="section-body">
        <div class="field-row cols-4">
          <div class="field-group"><label class="field-label">Trade #</label><input class="field-input" value="${entry.tradeNumber || '— assigned on save'}" readonly></div>
          <div class="field-group"><label class="field-label">Date</label><input class="field-input" type="date" data-field="tradeDate" value="${entry.tradeDate || ''}"></div>
          <div class="field-group"><label class="field-label">Entry time</label><input class="field-input" type="time" data-field="entryTimeOnly" value="${(entry.entryTime || '').slice(11, 16)}"></div>
          <div class="field-group"><label class="field-label">Session</label>
            <select class="field-input" data-field="session"><option value="">—</option>${SESSIONS.map((s) => `<option ${entry.session === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
          </div>
        </div>
        <div class="field-row cols-4">
          <div class="field-group"><label class="field-label">Instrument</label>
            <select class="field-input" data-field="instrument"><option value="">—</option>${INSTRUMENT_SYMBOLS.map((s) => `<option value="${s}" ${entry.instrument === s ? 'selected' : ''}>${s} — ${getInstrument(s).label}</option>`).join('')}</select>
          </div>
          <div class="field-group"><label class="field-label">Trade Type</label><input class="field-input" data-field="setupType" value="${entry.setupType || ''}" placeholder="Enter here..."></div>
          <div class="field-group"><label class="field-label">Account Type</label><input class="field-input" data-field="accountId" value="${entry.accountId || ''}" placeholder="e.g. Sim 50K"></div>
          <div class="field-group"><label class="field-label">Contracts</label><input class="field-input" type="number" min="1" data-field="contracts" value="${entry.contracts ?? ''}"></div>
        </div>
        <div class="field-row cols-2">
          <div class="field-group"><label class="field-label">Trade Style</label><input class="field-input" data-field="tradeStyle" value="${entry.tradeStyle || ''}" placeholder="Enter here..."></div>
          <div class="field-group"><label class="field-label">Sniper Score</label><input class="field-input" data-field="sniperScore" value="${entry.sniperScore || ''}" placeholder="Enter here..."></div>
        </div>
        <div class="field-row">
          <div class="field-group"><label class="field-label">Position Type</label>
            <div class="position-toggle">
              <button type="button" class="position-btn long ${entry.direction === 'long' ? 'active' : ''}" data-direction="long">📈 Long (Bullish)</button>
              <button type="button" class="position-btn short ${entry.direction === 'short' ? 'active' : ''}" data-direction="short">📉 Short (Bearish)</button>
            </div>
            ${!entry.direction ? '<div class="small-help" style="margin-top:6px;color:var(--pink);">Not selected yet — required before this can be saved as final.</div>' : ''}
          </div>
        </div>
      </div>
    </div>`;
}

/** ChartScreenshotUploader — preview.html's "Chart items to include" note plus a real (not decorative) upload zone. */
function renderScreenshotUploader(entry) {
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-teal">📸</div><div><div class="section-title">Screenshots to Save</div><div class="section-sub">Unique notes for every trade</div></div></div>
      <div class="section-body">
        <div class="field-row cols-2">
          <div class="field-group">
            <label class="field-label">Chart items to include</label>
            <textarea class="field-textarea large" data-field="screenshotNotes" placeholder="List what your screenshots need to show for THIS trade.

Examples:
• 1H context
• sweep
• support flip
• imbalance
• exit levels">${entry.screenshotNotes || ''}</textarea>
          </div>
          <div class="cl-shot-grid" id="clShotGrid">
            ${(entry.screenshots || []).map((s, i) => `
              <div class="cl-shot-thumb" data-shot-index="${i}">
                <img data-shot-path="${s.path}" alt="Chart screenshot ${i + 1}" src="">
                <button type="button" class="cl-shot-remove" data-remove-shot="${i}" aria-label="Remove screenshot ${i + 1}">✕</button>
              </div>`).join('')}
            <label class="cl-shot-upload">
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple id="clShotInput" style="display:none;">
              <span class="upload-icon">📊</span><span class="upload-text">Add screenshot</span><span class="upload-sub">JPEG, PNG, WEBP, or GIF — up to 5MB</span>
            </label>
          </div>
        </div>
        <div id="clUploadStatus" class="small-help" role="status" aria-live="polite"></div>
      </div>
    </div>`;
}

/** ScaleOutEditor — the corrected long/short calculator, fields trimmed to preview.html's fixed 3-partial layout. */
function renderScaleOutEditor(entry) {
  const totals = computeTradeTotals(entry);
  const exits = [0, 1, 2].map((i) => (entry.exits && entry.exits[i]) || { contracts: '', exitPrice: '' });
  const instrument = getInstrument(entry.instrument);
  const defaultPointValue = entry.manualPointValue ?? (instrument ? instrument.pointValue : '');
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-teal">💸</div><div><div class="section-title">Entry &amp; Scale-Out Exits</div><div class="section-sub">Auto-calc for scale-outs</div></div></div>
      <div class="section-body">
        <div class="field-row cols-2">
          <div class="field-group"><label class="field-label">Entry Price</label><input class="field-input" type="number" step="0.01" data-field="entryPrice" value="${entry.entryPrice ?? ''}"></div>
          <div class="field-group"><label class="field-label">Total Profit</label><input class="field-input" value="${totals.netPnl != null && totals.totalContracts ? fmtMoney(totals.netPnl) : ''}" placeholder="auto" readonly></div>
        </div>
        <table class="trade-table" id="clScaleTable">
          <thead><tr><th>Scale Out</th><th>Contracts</th><th>Exit Price</th><th>Points</th><th>Dollar Result</th></tr></thead>
          <tbody>
            ${exits.map((ex, i) => {
              const computed = totals.computedExits[i] || {};
              return `<tr data-exit-row="${i}">
                <td>Partial ${i + 1}</td>
                <td><input class="field-input" type="number" min="0" step="1" data-exit-field="contracts" data-exit-index="${i}" value="${ex.contracts ?? ''}" placeholder="0"></td>
                <td><input class="field-input" type="number" step="0.01" data-exit-field="exitPrice" data-exit-index="${i}" value="${ex.exitPrice ?? ''}" placeholder="0.00"></td>
                <td><input class="field-input" value="${computed.points != null ? fmt(computed.points) : ''}" placeholder="auto" readonly></td>
                <td><input class="field-input" value="${computed.dollars != null ? fmtMoney(computed.dollars) : ''}" placeholder="auto" readonly></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        <div class="small-help" style="margin-top:10px">${instrument
          ? `Uses ${instrument.label} math by default at $${instrument.pointValue} per point per contract. Change the point value below if needed.`
          : 'Select an instrument in Trade Details, or set a point value below.'}</div>
        ${totals.exceedsPosition ? `<div class="cl-warn-inline">⚠ Scale-out contracts (${totals.totalContracts}) exceed your position size (${entry.contracts}).</div>` : ''}
        <div class="field-row cols-3" style="margin-top:16px">
          <div class="field-group"><label class="field-label">Weighted Points Captured</label><input class="field-input" value="${totals.weightedPoints ? fmt(totals.weightedPoints) + ' pts' : ''}" placeholder="auto" readonly></div>
          <div class="field-group"><label class="field-label">Point Value Per Contract</label><input class="field-input" type="number" step="0.01" data-field="manualPointValue" value="${defaultPointValue}"></div>
          <div class="field-group"><label class="field-label">Outcome</label>
            <div class="outcome-toggle">
              ${['win', 'loss', 'breakeven'].map((o) => `<button type="button" class="outcome-btn outcome-${o === 'breakeven' ? 'be' : o} ${(entry.outcomeOverride || computeOutcome(totals.netPnl)) === o ? 'active' : ''}" data-outcome="${o}">${o === 'win' ? '✓ Win' : o === 'loss' ? '✕ Loss' : '≈ Breakeven'}</button>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

/** TradeReasoning — matches preview.html's Why I Entered / Why I Exited / Lessons Logged. */
function renderTradeReasoning(entry) {
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-peach">📍</div><div><div class="section-title">Why I Entered</div></div></div>
      <div class="section-body"><textarea class="field-textarea xl" data-field="entryReasoning" placeholder="Overall context, key observations, execution logic...">${entry.entryReasoning || ''}</textarea></div>
    </div>
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-pink">📤</div><div><div class="section-title">Why I Exited</div></div></div>
      <div class="section-body"><textarea class="field-textarea large" data-field="exitReasoning" placeholder="Why did you scale out or close where you did?">${entry.exitReasoning || ''}</textarea></div>
    </div>
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-indigo">🧠</div><div><div class="section-title">Lessons Logged</div></div></div>
      <div class="section-body"><textarea class="field-textarea large" data-field="lessons" placeholder="What did the market show you? What do you want to repeat or clean up?">${entry.lessons || ''}</textarea></div>
    </div>`;
}

/** EmotionCheckIn — matches preview.html's Emotional Check-In section, including the reflection quote and inline stars. */
function renderEmotionCheckIn(entry) {
  const emotions = entry.emotions || {};
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-pink">💖</div><div><div class="section-title">Emotional Check-In</div><div class="section-sub">Track your state, not just the setup</div></div></div>
      <div class="section-body">
        <div class="emotion-grid">
          ${['entering', 'during', 'exiting'].map((stage) => `
            <div class="emotion-row">
              <span class="emotion-stage">${stage === 'entering' ? 'Entering trade' : stage === 'during' ? 'During trade' : 'Exiting trade'}</span>
              <div class="emotion-options" data-emotion-stage="${stage}">
                ${EMOTION_OPTIONS[stage].map((o) => `<button type="button" class="emotion-btn ${emotions[stage]?.primary === o ? 'active' : ''}" data-emotion="${o}">${o}</button>`).join('')}
              </div>
            </div>`).join('')}
        </div>
        <div class="field-group" style="margin-top:20px"><label class="field-label">Reflection quote</label><textarea class="field-textarea" data-emotion-reflection placeholder="How did this trade feel overall?">${emotions.reflectionQuote || ''}</textarea></div>
        <div style="margin-top:20px"><label class="field-label" style="display:block;margin-bottom:10px">Execution Quality</label><div class="stars" data-star-field="executionRating">${[1, 2, 3, 4, 5].map((n) => `<div class="star ${entry.executionRating >= n ? 'active' : ''}" data-star="${n}">★</div>`).join('')}</div></div>
      </div>
    </div>`;
}

/** StructureReflection — matches preview.html's Structure Insight + Final Reflection (with mindset pills). */
function renderStructureReflection(entry) {
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-teal">🧭</div><div><div class="section-title">Structure Insight</div></div></div>
      <div class="section-body">
        <textarea class="field-textarea large" data-field="structureInsight" placeholder="What did this trade teach you about structure?">${entry.structureInsight || ''}</textarea>
        <div class="field-group" style="margin-top:14px"><label class="field-label">What this means</label><textarea class="field-textarea" data-field="oneSentenceTakeaway">${entry.oneSentenceTakeaway || ''}</textarea></div>
      </div>
    </div>
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-dark">🪞</div><div><div class="section-title">Final Reflection</div></div></div>
      <div class="section-body">
        <textarea class="field-textarea xl" data-field="finalReflection" placeholder="What does this trade say about where you are right now as a trader?">${entry.finalReflection || ''}</textarea>
        <div class="mindset-pills">
          <div class="mindset-pill mp-green">🌱 Still growing</div>
          <div class="mindset-pill mp-pink">✨ Refining my lens</div>
          <div class="mindset-pill mp-teal">🎯 One clean setup at a time</div>
        </div>
      </div>
    </div>`;
}

function stageTopBarHtml(active) {
  return `
    <div class="cl-stage-topbar">
      <div class="cl-stage-pills">${STAGES.map((s) => `<button type="button" class="dd-tab ${s === active ? 'active' : ''}" data-stage="${s}">${STAGE_LABELS[s]}</button>`).join('')}</div>
      <button type="button" class="cl-delete-link" id="clDeleteBtn">Delete Entry</button>
    </div>`;
}

/** Bottom wizard nav: Back/Next on the first 3 stages, Back/Save Entry on the last. */
function renderWizardNav(container, { activeStage, status, onBack, onNext, onSaveFinal }) {
  const idx = STAGES.indexOf(activeStage);
  const isFirst = idx === 0;
  const isLast = idx === STAGES.length - 1;
  const statusText = status === 'saving' ? 'Saving…' : status === 'error' ? '⚠ Couldn’t save — retrying' : 'Saved ✓';

  container.innerHTML = isLast ? `
    <div class="cl-wizard-nav">
      <span class="save-quote">“Trade what you see, not what you think.” — Dayli</span>
      <div style="display:flex;align-items:center;gap:10px;">
        ${!isFirst ? '<button type="button" class="dd-secondary-btn" id="clBackBtn">← Back</button>' : ''}
        <button type="button" class="dd-primary-btn" id="clSaveEntryBtn">✦ Save Entry</button>
      </div>
    </div>` : `
    <div class="cl-wizard-nav">
      <span class="cl-nav-status">${statusText}</span>
      <div style="display:flex;align-items:center;gap:10px;">
        ${!isFirst ? '<button type="button" class="dd-secondary-btn" id="clBackBtn">← Back</button>' : ''}
        <button type="button" class="dd-primary-btn" id="clNextBtn">Next →</button>
      </div>
    </div>`;

  if (!isFirst) container.querySelector('#clBackBtn').addEventListener('click', onBack);
  if (isLast) {
    const btn = container.querySelector('#clSaveEntryBtn');
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Saving…';
      try {
        await onSaveFinal();
      } catch (err) {
        console.error('Save entry error:', err);
        btn.disabled = false;
        btn.textContent = '✦ Save Entry';
        alert("Couldn't save this entry — try again in a moment.");
      }
    });
  } else {
    container.querySelector('#clNextBtn').addEventListener('click', onNext);
  }
}

async function hydrateScreenshotThumbs(container, apiFetch) {
  const imgs = container.querySelectorAll('img[data-shot-path]');
  for (const img of imgs) {
    const path = img.dataset.shotPath;
    try {
      const { url } = await apiFetch(`/api/journal-screenshot?path=${encodeURIComponent(path)}`);
      img.src = url;
    } catch (err) {
      console.error('Screenshot load error:', err);
    }
  }
}

/**
 * Orchestrates the whole entry page across its 4 stages.
 * `helpers`: { onChange(nextEntry), onDelete(), onSaveFinal(), apiFetch(path, opts), uploadScreenshot(file, entryId) }
 */
export function renderJournalEntryPage(container, entry, helpers) {
  let activeStage = 'trade';

  function update(next) {
    entry = next;
    helpers.onChange(entry);
    paint();
  }

  function paint() {
    container.innerHTML = `
      ${stageTopBarHtml(activeStage)}
      <div id="clStageBody"></div>
      <div id="clNavBar"></div>
    `;
    const body = container.querySelector('#clStageBody');
    if (activeStage === 'trade') {
      body.innerHTML = renderTradeDetailsForm(entry) + renderScreenshotUploader(entry);
      hydrateScreenshotThumbs(body, helpers.apiFetch);
    } else if (activeStage === 'execution') {
      body.innerHTML = renderScaleOutEditor(entry);
    } else if (activeStage === 'mindset') {
      body.innerHTML = renderEmotionCheckIn(entry);
    } else {
      body.innerHTML = renderTradeReasoning(entry) + renderStructureReflection(entry);
    }
    wireStage(body);

    renderWizardNav(container.querySelector('#clNavBar'), {
      activeStage,
      status: helpers.saveStatus || 'saved',
      onBack: () => { activeStage = STAGES[STAGES.indexOf(activeStage) - 1]; paint(); },
      onNext: () => { activeStage = STAGES[STAGES.indexOf(activeStage) + 1]; paint(); },
      onSaveFinal: helpers.onSaveFinal,
    });

    container.querySelector('#clDeleteBtn').addEventListener('click', helpers.onDelete);
    container.querySelectorAll('[data-stage]').forEach((btn) => {
      btn.addEventListener('click', () => { activeStage = btn.dataset.stage; paint(); });
    });
  }

  function wireStage(body) {
    body.querySelectorAll('[data-field]').forEach((el) => {
      const commit = () => {
        const field = el.dataset.field;
        let value = el.value;
        if (field === 'contracts' || field === 'entryPrice' || field === 'manualPointValue') {
          value = value === '' ? null : Number(value);
        }
        if (field === 'entryTimeOnly') {
          update({ ...entry, entryTime: `${entry.tradeDate || new Date().toISOString().slice(0, 10)}T${value}:00` });
          return;
        }
        update({ ...entry, [field]: value });
      };
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : el.tagName === 'TEXTAREA' ? 'input' : 'blur', commit);
    });

    const reflectionQuote = body.querySelector('[data-emotion-reflection]');
    if (reflectionQuote) reflectionQuote.addEventListener('input', () => {
      update({ ...entry, emotions: { ...entry.emotions, reflectionQuote: reflectionQuote.value } });
    });

    body.querySelectorAll('.position-btn').forEach((btn) => {
      btn.addEventListener('click', () => update({ ...entry, direction: btn.dataset.direction }));
    });

    body.querySelectorAll('[data-star-field]').forEach((group) => {
      const field = group.dataset.starField;
      group.querySelectorAll('.star').forEach((star) => {
        star.addEventListener('click', () => update({ ...entry, [field]: Number(star.dataset.star) }));
      });
    });

    body.querySelectorAll('[data-exit-field]').forEach((input) => {
      input.addEventListener('blur', () => {
        const idx = Number(input.dataset.exitIndex);
        const field = input.dataset.exitField;
        const exits = [0, 1, 2].map((i) => (entry.exits && entry.exits[i]) || { contracts: '', exitPrice: '' });
        exits[idx] = { ...exits[idx], [field]: input.value === '' ? '' : Number(input.value) };
        update({ ...entry, exits });
      });
    });

    body.querySelectorAll('.outcome-btn').forEach((btn) => {
      btn.addEventListener('click', () => update({ ...entry, outcomeOverride: btn.dataset.outcome }));
    });

    body.querySelectorAll('[data-emotion-stage]').forEach((group) => {
      const stage = group.dataset.emotionStage;
      group.querySelectorAll('.emotion-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const emotions = { ...entry.emotions, [stage]: { ...(entry.emotions?.[stage] || {}), primary: btn.dataset.emotion } };
          update({ ...entry, emotions });
        });
      });
    });

    const shotInput = body.querySelector('#clShotInput');
    if (shotInput) shotInput.addEventListener('change', async () => {
      const statusEl = body.querySelector('#clUploadStatus');
      for (const file of Array.from(shotInput.files)) {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          statusEl.textContent = `${file.name}: unsupported file type.`; continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          statusEl.textContent = `${file.name}: too large (max 5MB).`; continue;
        }
        statusEl.textContent = `Uploading ${file.name}…`;
        try {
          const path = await helpers.uploadScreenshot(file, entry.id);
          update({ ...entry, screenshots: [...(entry.screenshots || []), { path, uploadedAt: new Date().toISOString() }] });
          statusEl.textContent = `${file.name} uploaded ✓`;
          showDeskToast('Screenshot added ✦');
        } catch (err) {
          console.error('Screenshot upload error:', err);
          statusEl.textContent = `Couldn’t upload ${file.name}: ${err.message}`;
        }
      }
      shotInput.value = '';
    });
    body.querySelectorAll('[data-remove-shot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!confirm('Remove this screenshot?')) return;
        const idx = Number(btn.dataset.removeShot);
        const screenshots = entry.screenshots.filter((_, i) => i !== idx);
        update({ ...entry, screenshots });
      });
    });
  }

  paint();
  return {
    getState: () => entry,
    setSaveStatus: (status) => {
      helpers.saveStatus = status;
      renderWizardNav(container.querySelector('#clNavBar'), {
        activeStage,
        status,
        onBack: () => { activeStage = STAGES[STAGES.indexOf(activeStage) - 1]; paint(); },
        onNext: () => { activeStage = STAGES[STAGES.indexOf(activeStage) + 1]; paint(); },
        onSaveFinal: helpers.onSaveFinal,
      });
    },
  };
}
