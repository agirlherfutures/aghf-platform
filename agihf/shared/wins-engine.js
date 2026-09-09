/**
 * wins-engine.js — A Girl & Her Futures™
 *
 * Render layer for "Share My Win": the 7-step submission wizard, the
 * varied-layout win card, the public hub (hero/featured/wall/filters),
 * reactions, the win-detail drawer, "My Wins," and the admin moderation
 * console. Presentation only — copy lives in wins-copy.js, data access in
 * wins-service.js. Reuses the exact wizard-shell + accordion pattern
 * already proven in eval-calculator-wizard-engine.js (one continuous
 * draft object in closure, update(next) -> full paint()), the
 * variant-driven single-card-function pattern from journal-engine.js's
 * renderTradeSummaryCard, the pill-filter pattern from
 * journal-calendar-engine.js's renderViewSwitcher, and the
 * Escape/click-outside drawer shape from renderTradeDayDrawer.
 */

import { showDeskToast } from './dayli-desk-engine.js';
import { getWinMediaUrl } from './wins-service.js';
import {
  HERO_COPY, STAR_BANNER_COPY, SAMPLE_REVIEWS, WIN_CATEGORIES, WIN_FILTERS, categoryLabel, HEADLINE_EXAMPLES, STORY_PROMPTS,
  WHAT_HELPED_OPTIONS, TESTIMONIAL_PROMPT, MEDIA_TYPES, SENSITIVE_INFO_WARNING, SENSITIVE_INFO_CONFIRM_LABEL,
  REVIEW_PROMPTS, DISPLAY_NAME_OPTIONS, CONSENT_OPTIONS, CONSENT_REMOVAL_NOTE, STATUS_LABELS, SUBMIT_SUCCESS,
  EMPTY_STATE_COPY, RISK_DISCLOSURE_TEXT, REACTION_TYPES, MODERATION_ACTION_LABELS,
} from './wins-copy.js';

/* ── small generic helpers, matching the exact patterns already proven
   in eval-calculator-wizard-engine.js / journal-engine.js ────────────── */

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function fieldRow(label, inputHtml, help) {
  return `<div class="field-group"><label class="field-label">${label}</label>${inputHtml}${help ? `<div class="small-help" style="margin-top:6px;">${help}</div>` : ''}</div>`;
}

function chipGroupHtml({ mode, field, options, value }) {
  // Normalizes both shapes used across wins-copy.js: plain strings
  // (WHAT_HELPED_OPTIONS) and {key,label} objects (WIN_CATEGORIES,
  // DISPLAY_NAME_OPTIONS) — falling back to `.key` when `.value` isn't
  // present, rather than requiring every call site to pre-map its data.
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : { ...o, value: o.value ?? o.key }));
  const selected = mode === 'multi' ? (value || []) : null;
  return `<div class="chip-group" data-chip-${mode}="${field}">
    ${opts.map((o) => {
      const active = mode === 'multi' ? selected.includes(o.value) : value === o.value;
      return `<button type="button" class="chip ${active ? 'active' : ''}" data-chip-value="${o.value ?? ''}">${o.icon ? o.icon + ' ' : ''}${o.label}</button>`;
    }).join('')}
  </div>`;
}

function toggleBtn(key, isOpen, labelOpen = 'Hide', labelClosed = 'Show') {
  return `<button type="button" class="cl-toggle-btn" data-toggle-section="${key}">${isOpen ? labelOpen : labelClosed} ${isOpen ? '▴' : '▾'}</button>`;
}

const AVATAR_PALETTE = ['pink', 'peach', 'teal', 'purple'];
/** Deterministic initial-letter avatar — no photo asset required, gives
 * every card/review the same warm "real person" visual language. */
function renderAvatar(name) {
  const clean = String(name ?? '').trim();
  const letter = clean ? clean[0].toUpperCase() : '✦';
  let hash = 0;
  for (let i = 0; i < clean.length; i += 1) hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  const color = AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
  return `<span class="win-avatar win-avatar-${color}" aria-hidden="true">${escapeHtml(letter)}</span>`;
}

/* ── Win card — one function, 6 variants, exactly mirroring
   journal-engine.js's entryToSummaryCardProps()/renderTradeSummaryCard() ── */

/** @param {import('./dashboard-models.js').WinSubmissionRecord} win */
export function winToCardProps(win) {
  const showsMoney = win.exactPnlOptIn || /payout|funded|evaluation/i.test(`${win.primaryCategory} ${win.outcomeSummary || ''}`);
  return {
    id: win.id,
    category: win.primaryCategory,
    categoryLabel: categoryLabel(win.primaryCategory),
    headline: win.headline || categoryLabel(win.primaryCategory),
    storyShort: (win.story || '').slice(0, 220),
    testimonial: win.testimonialText || '',
    whatHelped: Array.isArray(win.whatHelped) ? win.whatHelped : [],
    displayName: win.isAnonymous ? 'Anonymous AGHF Member' : (win.displayNameSnapshot || 'An AGHF Member'),
    screenshotPath: win.media?.find((m) => m.mimeType?.startsWith('image/'))?.path || null,
    hasVideo: !!win.videoUrl,
    videoUrl: win.videoUrl || null,
    isFeatured: win.status === 'featured',
    isVerified: !!win.isVerified,
    date: fmtDate(win.approvedAt || win.createdAt),
    exactPnl: win.exactPnlOptIn ? win.exactPnl : null,
    outcomeSummary: win.outcomeSummary || '',
    showsMoney,
  };
}

export function renderRiskDisclosure() {
  return `<div class="small-help win-risk-disclosure">${RISK_DISCLOSURE_TEXT}</div>`;
}

/** @param {ReturnType<typeof winToCardProps>} props */
export function renderWinCard(props, opts = {}) {
  const variant = opts.variant
    || (props.hasVideo ? 'video' : props.screenshotPath ? 'screenshot' : props.testimonial ? 'quote' : props.storyShort ? 'full-story' : 'short');
  return `
    <button type="button" class="win-card win-card-${variant}" data-win-id="${props.id}">
      ${props.isFeatured ? '<span class="win-card-featured-badge">✦ Featured</span>' : ''}
      ${variant === 'screenshot' && props.screenshotPath ? `<div class="win-card-shot" data-win-shot-path="${props.screenshotPath}"></div>` : ''}
      ${variant === 'video' ? '<div class="win-card-video-mark">▶ Video</div>' : ''}
      <div class="win-card-body">
        <div class="win-card-category">${props.categoryLabel}</div>
        <div class="win-card-headline">${escapeHtml(props.headline)}</div>
        ${variant === 'quote'
          ? `<div class="win-card-quote">“${escapeHtml(props.testimonial || props.storyShort)}”</div>`
          : props.storyShort ? `<p class="win-card-story">${escapeHtml(props.storyShort)}${props.storyShort.length >= 220 ? '…' : ''}</p>` : ''}
        <div class="win-card-footer">
          <span class="win-card-name">${renderAvatar(props.displayName)}${escapeHtml(props.displayName)}${props.isVerified ? ' <span class="win-card-verified" title="Verified by AGHF">✓</span>' : ''}</span>
          <span class="win-card-date">${props.date}</span>
        </div>
        ${props.showsMoney ? renderRiskDisclosure() : ''}
      </div>
    </button>`;
}

/* ── Star banner + reviews scroll (top-of-page, above the hero) ──────── */

export function renderFiveStarBanner() {
  return `
    <div class="win-star-banner">
      <div class="win-star-row" aria-hidden="true">${STAR_BANNER_COPY.stars}</div>
      <div class="win-star-label">${STAR_BANNER_COPY.label}</div>
    </div>`;
}

/** Auto-scrolling review carousel. SAMPLE_REVIEWS is placeholder content
 * (see wins-copy.js) — swap for real, consented member reviews once
 * there are enough approved ones to feature. */
export function renderReviewsScroll(container, reviews = SAMPLE_REVIEWS) {
  const cardsHtml = reviews.map((r) => `
    <div class="win-review-card">
      <div class="win-review-top">
        ${renderAvatar(r.name)}
        <div>
          <div class="win-review-name">${escapeHtml(r.name)}</div>
          <div class="win-review-stars" aria-hidden="true">★★★★★</div>
        </div>
      </div>
      <p class="win-review-quote">“${escapeHtml(r.quote)}”</p>
    </div>`).join('');
  // Duplicated once so the CSS marquee can loop seamlessly at -50% — skipped
  // for prefers-reduced-motion, where the track never animates and a
  // manual horizontal scroll should only show each review once.
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  container.innerHTML = `
    <div class="win-reviews-scroll">
      <div class="win-reviews-track">${cardsHtml}${reduceMotion ? '' : cardsHtml}</div>
    </div>`;
}

/* ── Featured strip + Win Wall + filters + empty state ───────────────── */

export function renderFeaturedWinsStrip(container, wins) {
  if (!wins.length) { container.innerHTML = ''; return; }
  const [hero, ...rest] = wins;
  container.innerHTML = `
    <div class="win-featured-strip">
      <div class="win-featured-hero">${renderWinCard(winToCardProps(hero), { variant: hero.videoUrl ? 'video' : hero.media?.length ? 'screenshot' : 'full-story' })}</div>
      ${rest.length ? `<div class="win-featured-support">${rest.slice(0, 3).map((w) => renderWinCard(winToCardProps(w), { variant: 'short' })).join('')}</div>` : ''}
    </div>`;
  hydrateWinShots(container);
}

export function renderWinFilters(container, activeFilter, onChange) {
  container.innerHTML = `<div class="chip-group win-filter-row" data-view-switch="1">
    ${WIN_FILTERS.map((f) => `<button type="button" class="chip ${f.key === activeFilter ? 'active' : ''}" data-filter-key="${f.key}">${f.icon ? f.icon + ' ' : ''}${f.label}</button>`).join('')}
  </div>`;
  container.querySelectorAll('[data-filter-key]').forEach((btn) => {
    btn.addEventListener('click', () => onChange(btn.dataset.filterKey));
  });
}

export function renderEmptyWinWall(container) {
  container.innerHTML = `
    <div class="win-empty-state">
      <div class="win-empty-icon">✦</div>
      <div class="win-empty-heading">${EMPTY_STATE_COPY.heading}</div>
      <p class="win-empty-body">${EMPTY_STATE_COPY.body}</p>
      <a class="dd-primary-btn" href="share-win-flow.html">${EMPTY_STATE_COPY.cta}</a>
    </div>`;
}

export function renderCommunityWinWall(container, wins, handlers) {
  if (!wins.length) { renderEmptyWinWall(container); return; }
  container.innerHTML = `<div class="win-wall-grid">${wins.map((w) => renderWinCard(winToCardProps(w))).join('')}</div>`;
  container.querySelectorAll('[data-win-id]').forEach((card) => {
    card.addEventListener('click', () => handlers.onOpenWin(card.dataset.winId));
  });
  hydrateWinShots(container);
}

async function hydrateWinShots(container) {
  const nodes = container.querySelectorAll('[data-win-shot-path]');
  for (const el of nodes) {
    try {
      const url = await getWinMediaUrl(el.dataset.winShotPath);
      if (url) el.style.backgroundImage = `url(${url})`;
      else el.classList.add('win-shot-unavailable');
    } catch { el.classList.add('win-shot-unavailable'); }
  }
}

/* ── Reaction bar ─────────────────────────────────────────────────────── */

export function renderReactionBar(container, winId, counts, mine, handlers) {
  container.innerHTML = `<div class="win-reaction-bar" data-win-id="${winId}">
    ${REACTION_TYPES.map((r) => {
      const active = mine.includes(r.key);
      const n = counts[r.key] || 0;
      return `<button type="button" class="win-reaction-btn ${active ? 'active' : ''}" data-reaction-key="${r.key}" aria-pressed="${active}" aria-label="${r.label}">
        <span class="win-reaction-emoji">${r.emoji}</span> ${r.label}${n ? ` <span class="win-reaction-count">${n}</span>` : ''}
      </button>`;
    }).join('')}
  </div>`;
  container.querySelectorAll('[data-reaction-key]').forEach((btn) => {
    btn.addEventListener('click', () => handlers.onToggle(btn.dataset.reactionKey, !btn.classList.contains('active')));
  });
}

/* ── Win detail drawer — copies renderTradeDayDrawer's Escape/click-outside shape ── */

export function renderWinDetailDrawer(container, win, reactionData, handlers) {
  const props = winToCardProps(win);
  container.innerHTML = `
    <div class="win-drawer-host" id="winDrawerHost">
      <div class="win-drawer">
        <button type="button" class="win-drawer-close" id="winDrawerClose" aria-label="Close">✕</button>
        <div class="win-drawer-category">${props.categoryLabel}</div>
        <div class="win-drawer-headline">${escapeHtml(props.headline)}</div>
        <div class="win-drawer-meta"><span class="win-card-name">${renderAvatar(props.displayName)}${escapeHtml(props.displayName)}</span>${props.isVerified ? ' · Verified ✓' : ''} · ${props.date}</div>
        ${props.screenshotPath ? `<div class="win-drawer-shot" data-win-shot-path="${props.screenshotPath}"></div>` : ''}
        ${props.hasVideo ? `<a class="dd-secondary-btn" href="${escapeHtml(props.videoUrl)}" target="_blank" rel="noopener">▶ Watch the video</a>` : ''}
        ${win.story ? `<p class="win-drawer-story">${escapeHtml(win.story)}</p>` : ''}
        ${win.testimonialText ? `<div class="win-drawer-quote">“${escapeHtml(win.testimonialText)}”</div>` : ''}
        ${props.whatHelped.length ? `<div class="win-drawer-helped"><strong>What helped:</strong> ${props.whatHelped.map(escapeHtml).join(', ')}</div>` : ''}
        ${props.showsMoney ? renderRiskDisclosure() : ''}
        <div id="winDrawerReactions" style="margin-top:16px;"></div>
      </div>
    </div>`;
  if (props.screenshotPath) hydrateWinShots(container);
  renderReactionBar(container.querySelector('#winDrawerReactions'), win.id, reactionData.counts, reactionData.mine, handlers);

  const close = () => handlers.onClose();
  container.querySelector('#winDrawerClose').addEventListener('click', close);
  container.querySelector('#winDrawerHost').addEventListener('click', (e) => { if (e.target.id === 'winDrawerHost') close(); });
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
  });
}

export function closeWinDetailDrawer(container) {
  container.innerHTML = '';
}

/* ── The 7-step Share My Win wizard ──────────────────────────────────── */

const STEPS = ['category', 'story', 'whatHelped', 'media', 'review', 'consent', 'preview'];
const STEP_LABELS = {
  category: 'What Are We Celebrating?', story: 'Tell Us About Your Win', whatHelped: 'What Helped?',
  media: 'Add Proof or Personality', review: 'Review AGHF', consent: 'Choose How It Can Be Shared', preview: 'Preview & Submit',
};

function renderCategoryStep(draft) {
  return `
    <div class="win-wizard-panel">
      <div class="pg-eye">Step 1 of 7 · ${STEP_LABELS.category}</div>
      <div class="eval-step-heading">What kind of win are you sharing?</div>
      <div class="field-group" style="margin-top:16px;">
        <label class="field-label">Primary Category</label>
        ${chipGroupHtml({ mode: 'single', field: 'primaryCategory', value: draft.primaryCategory, options: WIN_CATEGORIES })}
      </div>
      <div class="field-group" style="margin-top:16px;">
        <label class="field-label">A Second Category (optional)</label>
        ${chipGroupHtml({ mode: 'single', field: 'secondaryCategory', value: draft.secondaryCategory, options: WIN_CATEGORIES })}
      </div>
      <div class="eval-step-actions">
        <button type="button" class="dd-primary-btn" id="winStepContinue" ${draft.primaryCategory ? '' : 'disabled'}>Continue</button>
      </div>
    </div>`;
}

function renderStoryStep(draft) {
  return `
    <div class="win-wizard-panel">
      <div class="pg-eye">Step 2 of 7 · ${STEP_LABELS.story}</div>
      <div class="eval-step-heading">Give your win a headline.</div>
      <div class="small-help" style="margin:6px 0 12px;">Examples: ${HEADLINE_EXAMPLES.map((h) => `“${h}”`).join(' · ')}</div>
      ${fieldRow('Headline', `<input class="field-input" type="text" data-field="headline" value="${escapeHtml(draft.headline || '')}" maxlength="120" placeholder="e.g. My First Clean Week">`)}
      <div class="field-group" style="margin-top:16px;">
        <label class="field-label">${STORY_PROMPTS.main}</label>
        <textarea class="field-textarea" data-field="story" rows="6" placeholder="Tell it however feels natural...">${escapeHtml(draft.story || '')}</textarea>
        <div class="small-help" style="margin-top:8px;">Need inspiration? ${STORY_PROMPTS.optional.map((p) => p.label).join(' · ')}</div>
      </div>
      <div class="eval-step-actions">
        <button type="button" class="dd-secondary-btn" data-step-back="1">← Back</button>
        <button type="button" class="dd-primary-btn" id="winStepContinue">Continue</button>
      </div>
    </div>`;
}

function renderWhatHelpedStep(draft) {
  return `
    <div class="win-wizard-panel">
      <div class="pg-eye">Step 3 of 7 · ${STEP_LABELS.whatHelped}</div>
      <div class="eval-step-heading">What helped you reach this win?</div>
      ${chipGroupHtml({ mode: 'multi', field: 'whatHelped', value: draft.whatHelped, options: WHAT_HELPED_OPTIONS })}
      <div class="field-group" style="margin-top:16px;">
        <label class="field-label">${TESTIMONIAL_PROMPT} (optional)</label>
        <textarea class="field-textarea short" data-field="testimonialText" placeholder="Only if you feel like sharing...">${escapeHtml(draft.testimonialText || '')}</textarea>
      </div>
      <div class="eval-step-actions">
        <button type="button" class="dd-secondary-btn" data-step-back="1">← Back</button>
        <button type="button" class="dd-primary-btn" id="winStepContinue">Continue</button>
      </div>
    </div>`;
}

function renderMediaStep(draft) {
  return `
    <div class="win-wizard-panel">
      <div class="pg-eye">Step 4 of 7 · ${STEP_LABELS.media}</div>
      <div class="eval-step-heading">Add proof or personality (optional).</div>
      <div class="small-help win-sensitive-warning">${SENSITIVE_INFO_WARNING}</div>
      <div class="win-media-upload-row" style="margin-top:12px;">
        <label class="win-media-upload-btn">📎 Add a screenshot, certificate, or photo
          <input type="file" id="winMediaInput" accept="image/jpeg,image/png,image/webp,image/gif" hidden>
        </label>
        <span id="winMediaStatus" class="small-help" role="status" aria-live="polite"></span>
      </div>
      <div id="winMediaList" class="win-media-list">${(draft.media || []).map((m, i) => `
        <span class="win-media-chip">${escapeHtml(m.filename)} <button type="button" data-remove-media="${i}">✕</button></span>`).join('')}</div>
      ${fieldRow('Video link (optional)', `<input class="field-input" type="url" data-field="videoUrl" value="${escapeHtml(draft.videoUrl || '')}" placeholder="Paste a YouTube, Loom, or Drive link">`, 'Prefer a short video? Paste a link instead of uploading a file.')}
      <div class="field-group" style="margin-top:14px;">
        <label class="field-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;">
          <input type="checkbox" data-field-bool="sensitiveInfoConfirmed" ${draft.sensitiveInfoConfirmed ? 'checked' : ''}> ${SENSITIVE_INFO_CONFIRM_LABEL}
        </label>
      </div>
      <div class="eval-step-actions">
        <button type="button" class="dd-secondary-btn" data-step-back="1">← Back</button>
        <button type="button" class="dd-primary-btn" id="winStepContinue">Continue</button>
      </div>
    </div>`;
}

function renderReviewStep(draft) {
  return `
    <div class="win-wizard-panel">
      <div class="pg-eye">Step 5 of 7 · ${STEP_LABELS.review}</div>
      <div class="eval-step-heading">${REVIEW_PROMPTS.rating}</div>
      <div class="win-star-rating" data-field="rating" data-value="${draft.rating || 0}">
        ${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="win-star ${n <= (draft.rating || 0) ? 'filled' : ''}" data-star="${n}" aria-label="${n} star${n > 1 ? 's' : ''}">★</button>`).join('')}
      </div>
      ${fieldRow('A short review (optional)', `<textarea class="field-textarea short" data-field="reviewText">${escapeHtml(draft.reviewText || '')}</textarea>`)}
      ${fieldRow(REVIEW_PROMPTS.loveMost, `<textarea class="field-textarea short" data-field="loveMost">${escapeHtml(draft.loveMost || '')}</textarea>`)}
      ${fieldRow(REVIEW_PROMPTS.couldImprove, `<textarea class="field-textarea short" data-field="improvementFeedback">${escapeHtml(draft.improvementFeedback || '')}</textarea>`, REVIEW_PROMPTS.privacyNote)}
      <div class="eval-step-actions">
        <button type="button" class="dd-secondary-btn" data-step-back="1">← Back</button>
        <button type="button" class="dd-primary-btn" id="winStepContinue">Continue</button>
      </div>
    </div>`;
}

function renderConsentStep(draft) {
  const consent = draft.consent || {};
  return `
    <div class="win-wizard-panel">
      <div class="pg-eye">Step 6 of 7 · ${STEP_LABELS.consent}</div>
      <div class="eval-step-heading">Where can AGHF share this?</div>
      <div class="field-group" style="margin-top:14px;">
        <label class="field-label">Display Name</label>
        ${chipGroupHtml({ mode: 'single', field: 'displayNamePreference', value: draft.displayNamePreference, options: DISPLAY_NAME_OPTIONS })}
      </div>
      <div class="field-group" style="margin-top:18px;">
        <label class="field-label">Where AGHF May Share It</label>
        ${CONSENT_OPTIONS.map((opt) => `
          <label class="win-consent-row">
            <input type="checkbox" data-consent-field="${opt.key}" ${consent[opt.key] ? 'checked' : ''}>
            <span><strong>${opt.label}</strong><br><span class="small-help">${opt.help}</span></span>
          </label>`).join('')}
      </div>
      <div class="small-help" style="margin-top:10px;">${CONSENT_REMOVAL_NOTE}</div>
      <div class="eval-step-actions">
        <button type="button" class="dd-secondary-btn" data-step-back="1">← Back</button>
        <button type="button" class="dd-primary-btn" id="winStepContinue">Continue</button>
      </div>
    </div>`;
}

function renderPreviewStep(draft) {
  const previewProps = winToCardProps({ ...draft, displayNameSnapshot: draft._previewName || 'You', status: 'approved', createdAt: new Date().toISOString() });
  return `
    <div class="win-wizard-panel">
      <div class="pg-eye">Step 7 of 7 · ${STEP_LABELS.preview}</div>
      <div class="eval-step-heading">Here’s how your win will look.</div>
      <div class="win-preview-frame">${renderWinCard(previewProps, { variant: draft.videoUrl ? 'video' : (draft.media?.length ? 'screenshot' : (draft.testimonialText ? 'quote' : 'full-story')) })}</div>
      <div class="small-help" style="margin-top:10px;">This preview reflects your current answers — go back to edit anything before submitting.</div>
      <div class="eval-step3-actions">
        <button type="button" class="dd-primary-btn" id="winSubmitBtn">Submit My Win</button>
        <div class="eval-step3-secondary">
          <button type="button" class="cl-delete-link" data-step-back="1">Edit My Answers</button>
          <button type="button" class="cl-delete-link" id="winSaveDraftBtn">Save as Draft</button>
        </div>
      </div>
    </div>`;
}

const STEP_RENDERERS = {
  category: renderCategoryStep, story: renderStoryStep, whatHelped: renderWhatHelpedStep,
  media: renderMediaStep, review: renderReviewStep, consent: renderConsentStep, preview: renderPreviewStep,
};

/**
 * Orchestrates the 7-step wizard. `helpers`:
 * { onChange(nextDraft), onSaveDraft(draft)->Promise, onSubmit(draft)->Promise<{gpAwarded}>, onUploadMedia(file)->Promise, saveStatus }
 */
export function renderShareWinWizard(container, draft, helpers) {
  let stepIdx = 0;
  const openSections = new Set();

  function update(next) {
    draft = next;
    helpers.onChange(draft);
    paint();
  }

  function paint() {
    const step = STEPS[stepIdx];
    container.innerHTML = `
      <div class="eval-wizard-shell win-wizard-shell">
        <div class="eval-step-topbar">
          <div class="cl-stage-pills">${STEPS.map((s, i) => `<button type="button" class="dd-tab ${i === stepIdx ? 'active' : ''}" data-win-step="${i}">${i + 1}</button>`).join('')}</div>
          <span class="cl-nav-status">${helpers.saveStatus === 'saving' ? 'Saving…' : 'Saved ✓'}</span>
        </div>
        ${STEP_RENDERERS[step](draft)}
      </div>`;
    wireFields();
    wireNav();
  }

  function wireFields() {
    container.querySelectorAll('[data-field]').forEach((el) => {
      if (el.dataset.field === 'rating') return;
      const commit = () => update({ ...draft, [el.dataset.field]: el.value });
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'blur', commit);
    });
    container.querySelectorAll('[data-field-bool]').forEach((el) => {
      el.addEventListener('change', () => update({ ...draft, [el.dataset.fieldBool]: el.checked }));
    });
    container.querySelectorAll('[data-chip-single]').forEach((group) => {
      const field = group.dataset.chipSingle;
      group.querySelectorAll('.chip').forEach((btn) => {
        btn.addEventListener('click', () => update({ ...draft, [field]: draft[field] === btn.dataset.chipValue ? null : btn.dataset.chipValue }));
      });
    });
    container.querySelectorAll('[data-chip-multi]').forEach((group) => {
      const field = group.dataset.chipMulti;
      group.querySelectorAll('.chip').forEach((btn) => {
        btn.addEventListener('click', () => {
          const current = draft[field] || [];
          const value = btn.dataset.chipValue;
          update({ ...draft, [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] });
        });
      });
    });
    container.querySelectorAll('[data-consent-field]').forEach((el) => {
      el.addEventListener('change', () => update({ ...draft, consent: { ...(draft.consent || {}), [el.dataset.consentField]: el.checked } }));
    });
    const stars = container.querySelector('[data-field="rating"]');
    if (stars) {
      stars.querySelectorAll('[data-star]').forEach((btn) => {
        btn.addEventListener('click', () => update({ ...draft, rating: Number(btn.dataset.star) }));
      });
    }
    const mediaInput = container.querySelector('#winMediaInput');
    if (mediaInput) {
      mediaInput.addEventListener('change', async () => {
        const file = mediaInput.files[0];
        if (!file) return;
        const statusEl = container.querySelector('#winMediaStatus');
        if (file.size > 5 * 1024 * 1024) { statusEl.textContent = 'That file is over 5MB — try a smaller one.'; return; }
        statusEl.textContent = `Uploading ${file.name}…`;
        try {
          const uploaded = await helpers.onUploadMedia(file);
          statusEl.textContent = `${file.name} uploaded ✓`;
          update({ ...draft, media: [...(draft.media || []), uploaded] });
        } catch (err) {
          statusEl.textContent = `Couldn’t upload ${file.name}: ${err.message}`;
        }
      });
    }
    container.querySelectorAll('[data-remove-media]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const media = (draft.media || []).slice();
        media.splice(Number(btn.dataset.removeMedia), 1);
        update({ ...draft, media });
      });
    });
  }

  function wireNav() {
    container.querySelectorAll('[data-win-step]').forEach((btn) => {
      const i = Number(btn.dataset.winStep);
      if (i <= stepIdx) btn.addEventListener('click', () => { stepIdx = i; paint(); });
    });
    const cont = container.querySelector('#winStepContinue');
    if (cont) cont.addEventListener('click', () => { if (stepIdx < STEPS.length - 1) { stepIdx += 1; paint(); } });
    const back = container.querySelector('[data-step-back]');
    if (back) back.addEventListener('click', () => { if (stepIdx > 0) { stepIdx -= 1; paint(); } });
    const submitBtn = container.querySelector('#winSubmitBtn');
    if (submitBtn) submitBtn.addEventListener('click', async () => {
      try {
        const result = await helpers.onSubmit(draft);
        showDeskToast(SUBMIT_SUCCESS.title);
        if (helpers.onSubmitted) helpers.onSubmitted(result);
      } catch (err) {
        console.error('Win submit error:', err);
        alert('Couldn’t submit your win — try again in a moment.');
      }
    });
    const saveDraftBtn = container.querySelector('#winSaveDraftBtn');
    if (saveDraftBtn) saveDraftBtn.addEventListener('click', async () => {
      try {
        await helpers.onSaveDraft(draft);
        showDeskToast('Saved as draft ✦');
      } catch (err) {
        console.error('Win draft save error:', err);
        alert('Couldn’t save this draft — try again in a moment.');
      }
    });
  }

  paint();
  return { getState: () => draft, setSaveStatus: (status) => { helpers.saveStatus = status; }, jumpTo: (key) => { const i = STEPS.indexOf(key); if (i >= 0) { stepIdx = i; paint(); } } };
}

/* ── My Wins (private member area) ───────────────────────────────────── */

export function renderMyWinsList(container, wins, handlers) {
  if (!wins.length) {
    container.innerHTML = `<div class="win-empty-state"><div class="win-empty-icon">✦</div><div class="win-empty-heading">No wins shared yet</div><p class="win-empty-body">Whenever you’re ready, your first win is one step away.</p><a class="dd-primary-btn" href="share-win-flow.html">Share My Win</a></div>`;
    return;
  }
  container.innerHTML = wins.map((w) => {
    const meta = STATUS_LABELS[w.status] || { label: w.status, help: '' };
    return `
    <div class="dd-card win-my-row" data-win-id="${w.id}">
      <div class="win-my-row-top">
        <span class="win-status-badge win-status-${w.status}">${meta.label}</span>
        <span class="small-help">${fmtDate(w.updatedAt)}</span>
      </div>
      <div class="win-my-row-headline">${escapeHtml(w.headline || categoryLabel(w.primaryCategory))}</div>
      <div class="small-help">${meta.help}</div>
      ${w.memberVisibleFeedback ? `<div class="win-feedback-box">${escapeHtml(w.memberVisibleFeedback)}</div>` : ''}
      <div class="win-my-row-actions">
        ${['draft', 'needs_changes'].includes(w.status) ? `<a class="dd-secondary-btn" href="share-win-flow.html?id=${w.id}">${w.status === 'needs_changes' ? 'Respond' : 'Continue Editing'}</a>` : ''}
        ${w.status === 'draft' ? `<button type="button" class="cl-delete-link" data-delete-draft="${w.id}">Delete Draft</button>` : ''}
        ${['submitted', 'under_review', 'approved', 'featured', 'privately_received'].includes(w.status) ? `<button type="button" class="cl-delete-link" data-withdraw="${w.id}">Withdraw</button>` : ''}
        ${['approved', 'featured', 'submitted', 'under_review', 'privately_received'].includes(w.status) ? `<button type="button" class="cl-delete-link" data-edit-consent="${w.id}">Sharing Permissions</button>` : ''}
      </div>
      <div class="win-consent-editor" id="winConsentEditor-${w.id}" hidden></div>
    </div>`;
  }).join('');

  container.querySelectorAll('[data-delete-draft]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this draft? This can’t be undone.')) handlers.onDeleteDraft(btn.dataset.deleteDraft);
    });
  });
  container.querySelectorAll('[data-withdraw]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (confirm('Withdraw this win? It will no longer be visible anywhere.')) handlers.onWithdraw(btn.dataset.withdraw);
    });
  });
  container.querySelectorAll('[data-edit-consent]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.editConsent;
      const win = wins.find((w) => w.id === id);
      const host = container.querySelector(`#winConsentEditor-${id}`);
      if (!host.hidden) { host.hidden = true; host.innerHTML = ''; return; }
      host.hidden = false;
      host.innerHTML = CONSENT_OPTIONS.map((opt) => `
        <label class="win-consent-row">
          <input type="checkbox" data-consent-toggle="${opt.key}" ${win.consent?.[opt.key] ? 'checked' : ''}>
          <span>${opt.label}</span>
        </label>`).join('') + `<button type="button" class="dd-secondary-btn" data-save-consent="${id}" style="margin-top:8px;">Save Changes</button>`;
      host.querySelector(`[data-save-consent="${id}"]`).addEventListener('click', () => {
        const consent = {};
        CONSENT_OPTIONS.forEach((opt) => { consent[opt.key] = host.querySelector(`[data-consent-toggle="${opt.key}"]`).checked; });
        handlers.onUpdateConsent(id, consent);
      });
    });
  });
}

/* ── Admin moderation console ─────────────────────────────────────────── */

export function renderModerationQueue(container, wins, activeId, onSelect) {
  if (!wins.length) { container.innerHTML = '<div class="small-help" style="padding:20px;">Nothing waiting for review right now.</div>'; return; }
  container.innerHTML = wins.map((w) => `
    <button type="button" class="win-mod-queue-row ${w.id === activeId ? 'active' : ''}" data-select-win="${w.id}">
      <span class="win-status-badge win-status-${w.status}">${STATUS_LABELS[w.status]?.label || w.status}</span>
      <span class="win-mod-queue-headline">${escapeHtml(w.headline || categoryLabel(w.primaryCategory))}</span>
      <span class="small-help">${fmtDate(w.submittedAt || w.createdAt)}</span>
    </button>`).join('');
  container.querySelectorAll('[data-select-win]').forEach((btn) => btn.addEventListener('click', () => onSelect(btn.dataset.selectWin)));
}

export function renderModerationDetailPanel(container, win, handlers) {
  if (!win) { container.innerHTML = '<div class="small-help" style="padding:20px;">Select a submission to review.</div>'; return; }
  container.innerHTML = `
    <div class="dd-card win-mod-detail-card">
      <div class="win-status-badge win-status-${win.status}">${STATUS_LABELS[win.status]?.label || win.status}</div>
      <div class="win-mod-headline">${escapeHtml(win.headline || categoryLabel(win.primaryCategory))}</div>
      <div class="small-help">${categoryLabel(win.primaryCategory)}${win.secondaryCategory ? ` · ${categoryLabel(win.secondaryCategory)}` : ''} · ${escapeHtml(win.displayNameSnapshot || '')}</div>
      ${win.story ? `<p class="win-mod-story">${escapeHtml(win.story)}</p>` : ''}
      ${win.testimonialText ? `<div class="win-drawer-quote">“${escapeHtml(win.testimonialText)}”</div>` : ''}
      <div class="small-help"><strong>Sharing consent:</strong> ${Object.entries(win.consent || {}).filter(([, v]) => v).map(([k]) => k).join(', ') || 'none selected'}</div>
      ${win.rating ? `<div class="small-help"><strong>Rating:</strong> ${'★'.repeat(win.rating)}</div>` : ''}
      ${win.improvementFeedback ? `<div class="small-help win-private-feedback"><strong>Private feedback:</strong> ${escapeHtml(win.improvementFeedback)}</div>` : ''}
      ${win.adminNotes ? `<div class="small-help win-admin-notes"><strong>Internal notes:</strong><br>${escapeHtml(win.adminNotes).replace(/\n/g, '<br>')}</div>` : ''}

      <div class="win-mod-actions">
        <button type="button" class="dd-secondary-btn" data-mod-action="start_review">Start Review</button>
        <button type="button" class="dd-primary-btn" data-mod-action="approve">Approve</button>
        <button type="button" class="dd-secondary-btn" data-mod-action="feature">Feature</button>
        <button type="button" class="dd-secondary-btn" data-mod-action="unfeature">Unfeature</button>
        <button type="button" class="dd-secondary-btn" data-mod-action="verify">Verify Proof</button>
        <button type="button" class="dd-secondary-btn" data-mod-action="unverify">Remove Verification</button>
        <button type="button" class="cl-delete-link" data-mod-action="request_changes">Request Changes</button>
        <button type="button" class="cl-delete-link" data-mod-action="reject">Not Shared</button>
        <button type="button" class="cl-delete-link" data-mod-action="archive">Archive</button>
      </div>

      ${win.testimonialText ? `
      <div class="win-mod-subsection">
        <label class="field-label">Edit Testimonial Wording</label>
        <textarea class="field-textarea short" id="modWordingInput">${escapeHtml(win.testimonialText)}</textarea>
        <label class="win-consent-row"><input type="checkbox" id="modWordingConfirm"><span>I confirm this preserves the member’s meaning and the original wording is kept on file.</span></label>
        <button type="button" class="dd-secondary-btn" id="modWordingSave">Save Wording</button>
      </div>` : ''}

      <div class="win-mod-subsection">
        <label class="field-label">Internal Note</label>
        <textarea class="field-textarea short" id="modNoteInput" placeholder="Never shown to the member"></textarea>
        <button type="button" class="dd-secondary-btn" id="modNoteSave">Add Note</button>
      </div>
    </div>`;

  container.querySelectorAll('[data-mod-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.modAction;
      if (['request_changes', 'reject'].includes(action)) {
        const feedback = prompt(`${MODERATION_ACTION_LABELS[action]} — note for the member:`);
        if (feedback == null || !feedback.trim()) return;
        handlers.onAction(win.id, action, { memberVisibleFeedback: feedback.trim() });
        return;
      }
      handlers.onAction(win.id, action);
    });
  });
  const wordingSave = container.querySelector('#modWordingSave');
  if (wordingSave) wordingSave.addEventListener('click', () => {
    const newText = container.querySelector('#modWordingInput').value;
    const confirmed = container.querySelector('#modWordingConfirm').checked;
    if (!confirmed) { alert('Please confirm before saving changed wording.'); return; }
    handlers.onAction(win.id, 'edit_testimonial_wording', { newText, confirmed: true });
  });
  const noteSave = container.querySelector('#modNoteSave');
  if (noteSave) noteSave.addEventListener('click', () => {
    const text = container.querySelector('#modNoteInput').value.trim();
    if (!text) return;
    handlers.onAction(win.id, 'add_note', { text });
  });
}

/* ── Dashboard card ───────────────────────────────────────────────────── */

export function renderShareWinCard(container, featuredWin) {
  container.innerHTML = `
    <div class="dd-share-win-card">
      <div class="dd-share-win-copy">
        <div class="win-card-headline" style="margin-bottom:4px;">Have something worth celebrating?</div>
        <p class="small-help">Profit, discipline, clarity, consistency—it all counts.</p>
        <a class="dd-primary-btn" href="share-win-flow.html">Share My Win</a>
      </div>
      ${featuredWin ? `<div class="dd-share-win-preview">${renderWinCard(winToCardProps(featuredWin), { variant: 'short' })}</div>` : ''}
    </div>`;
  if (featuredWin) hydrateWinShots(container);
}
