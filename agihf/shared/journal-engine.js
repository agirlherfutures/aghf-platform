/**
 * journal-engine.js — A Girl & Her Futures™
 *
 * Render layer for the AG&HF Trade Journal entry page. Organized into 4
 * visible stages (Trade → Execution → Mindset → Reflection) switched by
 * tabs, matching the ADHD-friendly "one stage at a time, progress always
 * visible" requirement — every stage's answers persist when you switch
 * away, nothing resets.
 *
 * This is also where the P&L math preview.html got wrong is fixed:
 * `computeTradeTotals()` uses direction-aware points (long = exit -
 * entry, short = entry - exit), a real per-instrument point value from
 * instrument-data.js instead of a hidden $2 default, and validates scale-
 * out contracts never exceed the original position size.
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

const SETUP_TYPES = ['ICC Continuation', 'Retest', 'Liquidity Sweep', 'Range Reversal', 'Other'];
const SESSIONS = ['Asia', 'London', 'NY AM', 'NY Lunch', 'NY PM'];

/**
 * Corrected long/short scale-out math — the concrete bug fix from
 * preview.html, which computed `exit - entry` for every trade regardless
 * of direction (wrong for profitable shorts).
 * @param {import('./dashboard-models.js').JournalEntryRecord} entry
 */
export function computeTradeTotals(entry) {
  const instrument = getInstrument(entry.instrument);
  const pointValue = instrument ? instrument.pointValue : (entry.manualPointValue ?? null);
  const entryPrice = entry.entryPrice;
  const direction = entry.direction;
  const exits = entry.exits || [];

  let totalContracts = 0;
  let weightedPoints = 0;
  let grossPnl = 0;
  let weightedExitSum = 0;
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
    weightedExitSum += exitPrice * contracts;
    grossPnl += dollars;
    return { ...ex, points, dollars };
  });

  const remainingContracts = entry.contracts != null ? entry.contracts - totalContracts : null;
  const exceedsPosition = entry.contracts != null && totalContracts > entry.contracts;
  const weightedAvgExit = totalContracts ? weightedExitSum / totalContracts : null;
  const netPnl = grossPnl - (Number(entry.fees) || 0);
  const rMultiple = entry.plannedRisk ? netPnl / entry.plannedRisk : null;

  return {
    computedExits, totalContracts, remainingContracts, exceedsPosition,
    weightedPoints, weightedAvgExit, grossPnl, netPnl, rMultiple, pointValue,
  };
}

export function computeOutcome(netPnl) {
  if (netPnl == null) return null;
  if (netPnl > 0) return 'win';
  if (netPnl < 0) return 'loss';
  return 'breakeven';
}

function fmt(n) { return Number.isFinite(n) ? n.toFixed(2) : ''; }
function fmtMoney(n) { return Number.isFinite(n) ? `${n < 0 ? '−' : ''}$${Math.abs(n).toFixed(2)}` : ''; }

/** TradeDetailsForm */
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
          <div class="field-group"><label class="field-label">Setup type</label>
            <select class="field-input" data-field="setupType"><option value="">—</option>${SETUP_TYPES.map((s) => `<option ${entry.setupType === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
          </div>
          <div class="field-group"><label class="field-label">Account</label><input class="field-input" data-field="accountId" value="${entry.accountId || ''}" placeholder="e.g. Sim 50K"></div>
          <div class="field-group"><label class="field-label">Contracts</label><input class="field-input" type="number" min="1" data-field="contracts" value="${entry.contracts ?? ''}"></div>
        </div>
        <div class="field-row cols-2">
          <div class="field-group"><label class="field-label">Execution timeframe</label><input class="field-input" value="1M (Dayli ICC)" readonly></div>
          <div class="field-group"><label class="field-label">Setup-quality score</label>
            <div class="stars" data-star-field="setupQualityScore">${[1, 2, 3, 4, 5].map((n) => `<div class="star ${entry.setupQualityScore >= n ? 'active' : ''}" data-star="${n}">★</div>`).join('')}</div>
          </div>
        </div>
        <div class="field-row">
          <div class="field-group"><label class="field-label">Position</label>
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

/** ChartScreenshotUploader */
function renderScreenshotUploader(entry) {
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-teal">📸</div><div><div class="section-title">Chart Screenshots</div><div class="section-sub">Upload the marked chart(s) for this trade</div></div></div>
      <div class="section-body">
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
        <div id="clUploadStatus" class="small-help" style="margin-top:8px;" role="status" aria-live="polite"></div>
      </div>
    </div>`;
}

/** ScaleOutEditor — the corrected long/short calculator. */
function renderScaleOutEditor(entry) {
  const totals = computeTradeTotals(entry);
  const exits = entry.exits && entry.exits.length ? entry.exits : [{ contracts: '', exitPrice: '' }];
  const instrument = getInstrument(entry.instrument);
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-teal">💸</div><div><div class="section-title">Entry &amp; Scale-Out Exits</div><div class="section-sub">${instrument ? `${entry.instrument} — $${instrument.pointValue}/point/contract` : 'Select an instrument in Trade Details first'}</div></div></div>
      <div class="section-body">
        <div class="field-row cols-2">
          <div class="field-group"><label class="field-label">Entry price</label><input class="field-input" type="number" step="0.01" data-field="entryPrice" value="${entry.entryPrice ?? ''}"></div>
          <div class="field-group"><label class="field-label">Stop-loss / Take-profit</label>
            <div style="display:flex;gap:8px;">
              <input class="field-input" type="number" step="0.01" data-field="stopLoss" placeholder="Stop" value="${entry.stopLoss ?? ''}">
              <input class="field-input" type="number" step="0.01" data-field="takeProfit" placeholder="Target" value="${entry.takeProfit ?? ''}">
            </div>
          </div>
        </div>
        <table class="trade-table" id="clScaleTable">
          <thead><tr><th>Scale Out</th><th>Contracts</th><th>Exit Price</th><th>Points</th><th>Dollar Result</th><th></th></tr></thead>
          <tbody>
            ${exits.map((ex, i) => {
              const computed = totals.computedExits[i] || {};
              return `<tr data-exit-row="${i}">
                <td>Partial ${i + 1}</td>
                <td><input class="field-input" type="number" min="0" step="1" data-exit-field="contracts" data-exit-index="${i}" value="${ex.contracts ?? ''}"></td>
                <td><input class="field-input" type="number" step="0.01" data-exit-field="exitPrice" data-exit-index="${i}" value="${ex.exitPrice ?? ''}"></td>
                <td><input class="field-input" value="${computed.points != null ? fmt(computed.points) : ''}" readonly></td>
                <td><input class="field-input" value="${computed.dollars != null ? fmtMoney(computed.dollars) : ''}" readonly></td>
                <td>${exits.length > 1 ? `<button type="button" class="cl-remove-exit" data-remove-exit="${i}">✕</button>` : ''}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        <button type="button" class="dd-tab" id="clAddExit" style="margin-top:10px;">+ Add partial exit</button>
        ${totals.exceedsPosition ? `<div class="cl-warn-inline">⚠ Scale-out contracts (${totals.totalContracts}) exceed your position size (${entry.contracts}).</div>` : ''}
        <div class="field-row cols-4" style="margin-top:16px">
          <div class="field-group"><label class="field-label">Weighted points captured</label><input class="field-input" value="${totals.weightedPoints ? fmt(totals.weightedPoints) + ' pts' : ''}" readonly></div>
          <div class="field-group"><label class="field-label">Weighted avg exit</label><input class="field-input" value="${totals.weightedAvgExit != null ? fmt(totals.weightedAvgExit) : ''}" readonly></div>
          <div class="field-group"><label class="field-label">Remaining contracts</label><input class="field-input" value="${totals.remainingContracts ?? ''}" readonly></div>
          <div class="field-group"><label class="field-label">Fees</label><input class="field-input" type="number" step="0.01" data-field="fees" value="${entry.fees ?? ''}"></div>
        </div>
        <div class="field-row cols-3" style="margin-top:10px">
          <div class="field-group"><label class="field-label">Net P&amp;L</label><input class="field-input" value="${totals.netPnl != null ? fmtMoney(totals.netPnl) : ''}" readonly></div>
          <div class="field-group"><label class="field-label">Planned risk ($)</label><input class="field-input" type="number" step="0.01" data-field="plannedRisk" value="${entry.plannedRisk ?? ''}"></div>
          <div class="field-group"><label class="field-label">R multiple</label><input class="field-input" value="${totals.rMultiple != null ? totals.rMultiple.toFixed(2) + 'R' : ''}" readonly></div>
        </div>
        <div class="field-row" style="margin-top:10px">
          <div class="field-group"><label class="field-label">Outcome</label>
            <div class="outcome-toggle">
              ${['win', 'loss', 'breakeven'].map((o) => `<button type="button" class="outcome-btn outcome-${o === 'breakeven' ? 'be' : o} ${(entry.outcomeOverride || computeOutcome(totals.netPnl)) === o ? 'active' : ''}" data-outcome="${o}">${o === 'win' ? '✓ Win' : o === 'loss' ? '✕ Loss' : '≈ Breakeven'}</button>`).join('')}
            </div>
            ${entry.outcomeOverride ? '<div class="small-help" style="margin-top:6px;">Manually overridden — computed outcome was ' + (computeOutcome(totals.netPnl) || '—') + '.</div>' : ''}
          </div>
        </div>
      </div>
    </div>`;
}

/** TradeReasoning */
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

/** EmotionCheckIn */
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
      </div>
    </div>`;
}

/** ExecutionRating */
function renderExecutionRating(entry) {
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-peach">⭐</div><div><div class="section-title">Execution Rating</div></div></div>
      <div class="section-body">
        <div class="stars" data-star-field="executionRating">${[1, 2, 3, 4, 5].map((n) => `<div class="star ${entry.executionRating >= n ? 'active' : ''}" data-star="${n}">★</div>`).join('')}</div>
      </div>
    </div>`;
}

/** StructureReflection */
function renderStructureReflection(entry) {
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-teal">🧭</div><div><div class="section-title">Structure Insight</div></div></div>
      <div class="section-body">
        <textarea class="field-textarea large" data-field="structureInsight" placeholder="What did this trade teach you about structure?">${entry.structureInsight || ''}</textarea>
        <div class="field-group" style="margin-top:14px"><label class="field-label">One-sentence takeaway</label><textarea class="field-textarea" data-field="oneSentenceTakeaway">${entry.oneSentenceTakeaway || ''}</textarea></div>
      </div>
    </div>
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-dark">🪞</div><div><div class="section-title">Final Reflection</div></div></div>
      <div class="section-body"><textarea class="field-textarea xl" data-field="finalReflection" placeholder="What does this trade say about where you are right now as a trader?">${entry.finalReflection || ''}</textarea></div>
    </div>`;
}

/** JournalSaveBar */
export function renderJournalSaveBar(container, status, onDelete) {
  const statusText = status === 'saving' ? 'Saving…' : status === 'error' ? '⚠ Couldn’t save — retrying' : 'Saved ✓';
  container.innerHTML = `
    <div class="save-bar">
      <span class="save-quote">“Trade what you see, not what you think.” — Dayli</span>
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="cl-save-status cl-save-${status}" role="status" aria-live="polite">${statusText}</span>
        <button type="button" class="dd-secondary-btn" id="clDeleteBtn">Delete Entry</button>
      </div>
    </div>`;
  container.querySelector('#clDeleteBtn').addEventListener('click', onDelete);
}

function stagePillsHtml(active) {
  return `<div class="cl-stage-pills">${STAGES.map((s) => `<button type="button" class="dd-tab ${s === active ? 'active' : ''}" data-stage="${s}">${STAGE_LABELS[s]}</button>`).join('')}</div>`;
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
 * `helpers`: { onChange(nextEntry), onDelete(), apiFetch(path, opts), uploadScreenshot(file, entryId) }
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
      ${stagePillsHtml(activeStage)}
      <div id="clStageBody"></div>
      <div id="clSaveBar"></div>
    `;
    const body = container.querySelector('#clStageBody');
    if (activeStage === 'trade') {
      body.innerHTML = renderTradeDetailsForm(entry) + renderScreenshotUploader(entry);
      hydrateScreenshotThumbs(body, helpers.apiFetch);
    } else if (activeStage === 'execution') {
      body.innerHTML = renderScaleOutEditor(entry);
    } else if (activeStage === 'mindset') {
      body.innerHTML = renderEmotionCheckIn(entry) + renderExecutionRating(entry);
    } else {
      body.innerHTML = renderTradeReasoning(entry) + renderStructureReflection(entry);
    }
    renderJournalSaveBar(container.querySelector('#clSaveBar'), helpers.saveStatus || 'saved', helpers.onDelete);
    wireStage(body);

    container.querySelectorAll('[data-stage]').forEach((btn) => {
      btn.addEventListener('click', () => { activeStage = btn.dataset.stage; paint(); });
    });
  }

  function wireStage(body) {
    body.querySelectorAll('[data-field]').forEach((el) => {
      const commit = () => {
        const field = el.dataset.field;
        let value = el.value;
        if (field === 'contracts' || field === 'entryPrice' || field === 'stopLoss' || field === 'takeProfit' || field === 'fees' || field === 'plannedRisk') {
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
        const exits = (entry.exits && entry.exits.length ? entry.exits : [{}]).slice();
        exits[idx] = { ...exits[idx], [field]: input.value === '' ? '' : Number(input.value) };
        update({ ...entry, exits });
      });
    });
    const addExitBtn = body.querySelector('#clAddExit');
    if (addExitBtn) addExitBtn.addEventListener('click', () => {
      const exits = (entry.exits || []).concat([{ contracts: '', exitPrice: '' }]);
      update({ ...entry, exits });
    });
    body.querySelectorAll('[data-remove-exit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.removeExit);
        const exits = entry.exits.filter((_, i) => i !== idx);
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
  return { getState: () => entry, setSaveStatus: (status) => { helpers.saveStatus = status; renderJournalSaveBar(container.querySelector('#clSaveBar'), status, helpers.onDelete); } };
}
