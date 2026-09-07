/**
 * loop-engine.js — A Girl & Her Futures™
 *
 * The Dayli Learning Loop — a 6-stage lesson experience: Watch → Learn It →
 * See It → Try It → Say It Back → Save It, one stage visible at a time.
 * Opt-in via a lesson's `loop: true` flag (see agihf/lesson.html); the
 * existing blocks[]-driven renderLessonWizard in lesson-engine.js is
 * completely untouched and keeps driving every other lesson.
 *
 * Learn It carries the actual teaching content (breakdown/dayli_says/
 * confusion/catch_mistake) — See It and Try It are the visual/interactive
 * layer built on top of what Learn It just explained, not a substitute for
 * explaining it.
 *
 * Reuses the shared primitives lesson-engine.js already exports instead
 * of duplicating them: burst, showStreak, showToast, wireRetryOptions,
 * drawFrame, drawCandle, and the Learn It block renderers renderBreakdown/
 * renderDayliSays/renderConfusion/renderCatchMistake.
 */

import {
  burst, showStreak, showToast, drawFrame, drawCandle, wireRetryOptions,
  renderBreakdown, renderDayliSays, renderConfusion, renderCatchMistake,
} from './lesson-engine.js';

const STREAK_MESSAGES = { 2: ['👀', 'okayyy I see you 👀'], 3: ['🔥', "you're locked in 🔥"], 5: ['🎯', 'sniper energy activated 🎯'] };
let uidCounter = 0;

export function renderLoopWizard(data, opts) {
  const { onAward, nextHref, backHref, nextTitle, nextHook, nextCtaLabel } = opts;
  const lessonId = `${data.phase}-${data.lessonNumber}`;

  const steps = [
    { type: 'watch', label: 'Watch' },
    { type: 'learn_it', label: 'Learn It' },
    { type: 'see_it', label: 'See It' },
    { type: 'try_it', label: 'Try It' },
    { type: 'say_it_back', label: 'Say It Back' },
    { type: 'save_it', label: 'Save It' },
  ];

  let cur = 0;
  let streak = 0;
  let awarded = false;
  const done = steps.map(() => false);

  const wrap = document.getElementById('lwWrap');
  const dotsEl = document.getElementById('lwDots');
  const stepnameEl = document.getElementById('lwStepname');
  const prevBtn = document.getElementById('lwPrev');
  const nextBtn = document.getElementById('lwNext');

  const helpers = { handleStreak, burst };

  function handleStreak(correct) {
    if (correct) {
      streak += 1;
      const msg = STREAK_MESSAGES[streak];
      if (msg) showStreak(msg[0], msg[1]);
    } else {
      streak = 0;
    }
  }

  function markDone(i) {
    if (done[i]) return;
    done[i] = true;
    updateChrome();
  }

  function buildDots() {
    dotsEl.innerHTML = '';
    steps.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'lw-dot ' + (i < cur ? (done[i] ? 'done' : '') : i === cur ? 'active' : '');
      if (i <= cur || done[i]) d.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(d);
    });
  }

  function updateChrome() {
    stepnameEl.textContent = steps[cur].label;
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = !done[cur];
    nextBtn.textContent = cur === steps.length - 1 ? 'Done ✦' : done[cur] ? 'Next →' : stepPrompt(cur);
    buildDots();
  }

  function stepPrompt(i) {
    const type = steps[i].type;
    if (type === 'watch') return 'Watch first';
    if (type === 'learn_it') return 'Keep reading';
    if (type === 'see_it') return 'Work through it';
    if (type === 'try_it') return 'Make your call';
    if (type === 'say_it_back') return 'Say it back';
    return 'Continue';
  }

  function goTo(i) {
    if (i < 0 || i >= steps.length) return;
    cur = i;
    renderStep(cur);
    updateChrome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderStep(i) {
    const step = steps[i];
    wrap.innerHTML = '';
    const slide = document.createElement('div');
    slide.className = 'lw-slide active';
    wrap.appendChild(slide);

    if (step.type === 'watch') renderLoopWatch(slide, data, () => markDone(i));
    else if (step.type === 'learn_it') renderLearnIt(slide, data.learnIt || {}, () => markDone(i), helpers);
    else if (step.type === 'see_it') renderSeeIt(slide, data.seeIt || {}, () => markDone(i), helpers);
    else if (step.type === 'try_it') renderTryIt(slide, data.tryIt || {}, () => markDone(i), helpers);
    else if (step.type === 'say_it_back') renderSayItBack(slide, data.sayItBack || {}, lessonId, () => markDone(i));
    else if (step.type === 'save_it') renderSaveIt(slide, data, { lessonId, nextHref, backHref, nextTitle, nextHook, nextCtaLabel });
  }

  prevBtn.addEventListener('click', () => goTo(cur - 1));
  nextBtn.addEventListener('click', () => {
    if (!done[cur]) return;
    if (cur === steps.length - 1) return;
    const wasLastBeforeSave = cur === steps.length - 2;
    goTo(cur + 1);
    if (wasLastBeforeSave && !awarded) {
      awarded = true;
      burst();
      showToast(`+${data.xpValue} GP earned!`, `${data.title} complete 🫧✨`);
      onAward();
    }
  });

  goTo(0);
}

function appendLoopContinue(el, satisfy, label = 'Continue →') {
  if (el.querySelector('.lw-continue-btn.dl-added')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'lw-continue-btn dl-added';
  btn.textContent = label;
  btn.addEventListener('click', satisfy);
  el.appendChild(btn);
}

/* ── Watch (Launchpad + video + stubbed markers + Focus Mode) ──────── */

function renderLoopWatch(slide, data, satisfy) {
  const lp = data.launchpad || {};
  const markers = (data.watch && data.watch.markers) || [];
  const preview = data.watch && data.watch.preview;
  slide.innerHTML = `
    <div class="dl-launchpad">
      <div class="lw-eyebrow">✦ Lesson Launchpad</div>
      <h2>${data.title}</h2>
      ${lp.outcome ? `<p class="dl-outcome"><strong>By the end, you'll be able to:</strong> ${lp.outcome}</p>` : ''}
      <div class="dl-launchpad-meta">
        ${lp.estMinutes ? `<span class="lw-pill dur">~${lp.estMinutes} min</span>` : ''}
        <span class="lw-pill gp">+${data.xpValue} GP</span>
      </div>
      ${lp.missionQuestion ? `<div class="dl-mission-q"><div class="dl-mission-q-label">Your mission question</div><div class="dl-mission-q-text">${lp.missionQuestion}</div></div>` : ''}
    </div>
    <div class="dl-watch-block" id="dlWatchBlock">
      <button type="button" class="dl-focus-toggle" id="dlFocusToggle">⛶ Focus Mode</button>
      <div class="lw-video-block">
        ${preview ? `
          <canvas class="dl-watch-preview-canvas" id="dlWatchPreview" width="780" height="320"></canvas>
          <div class="dl-watch-preview-caption" id="dlWatchPreviewCaption"></div>
          <div class="lw-video-soon">Preview — full video coming soon</div>
        ` : `
          <div class="lw-video-bg"></div>
          <div class="lw-video-play">▶</div>
          ${!data.videoUrl ? '<div class="lw-video-soon">Video coming soon</div>' : ''}
        `}
        <div class="lw-video-duration">${data.videoDuration || ''}</div>
      </div>
      ${markers.length ? `
      <div class="dl-marker-rail" id="dlMarkerRail">
        ${markers.map((m) => `<button type="button" class="dl-marker"><span class="dl-marker-t">${m.t}</span><span class="dl-marker-label">${m.label}</span></button>`).join('')}
      </div>` : ''}
    </div>
    <button type="button" class="lw-continue-btn lw-watched-btn" id="lwWatchedBtn">✓ Watched — Continue</button>
  `;
  document.getElementById('lwWatchedBtn').addEventListener('click', satisfy);
  document.getElementById('dlFocusToggle').addEventListener('click', () => {
    slide.classList.toggle('dl-focus-active');
  });
  slide.querySelectorAll('.dl-marker').forEach((btn) => {
    btn.addEventListener('click', () => {
      showToast('Video coming soon', 'Markers will jump here once the video is live ✦');
    });
  });
  if (preview) renderWatchPreview(slide, preview);
}

// Silent, ambient placeholder for the video slot: loops the lesson's
// GUIDED_DRAWERS shape through its stages continuously with the same
// captions See It uses, instead of a static "video coming soon" card.
// Stops on its own once `slide` is no longer in the document (the next
// renderStep() call replaces #lwWrap's contents).
function renderWatchPreview(slide, preview) {
  const canvas = document.getElementById('dlWatchPreview');
  const captionEl = document.getElementById('dlWatchPreviewCaption');
  if (!canvas || !captionEl) return;
  const ctx = canvas.getContext('2d');
  const stages = preview.stages || [];
  if (!stages.length) return;
  const drawFn = GUIDED_DRAWERS[preview.shape] || GUIDED_DRAWERS.candle_anatomy;
  let idx = 0;

  function playStage() {
    if (!document.body.contains(canvas)) return;
    const stage = stages[idx];
    captionEl.textContent = stage.caption || '';
    drawFn(ctx, canvas.width, canvas.height, stage, preview, () => {
      if (!document.body.contains(canvas)) return;
      setTimeout(() => {
        if (!document.body.contains(canvas)) return;
        idx = (idx + 1) % stages.length;
        playStage();
      }, idx === stages.length - 1 ? 1400 : 550);
    });
  }
  playStage();
}

/* ── Learn It: the actual teaching content ──────────────────────────── */

// Restored, not invented — breakdown/dayli_says/confusion/catch_mistake
// blocks, pulled verbatim from the pre-loop lesson schema, so concepts get
// explained here before See It/Try It test or visualize them.
function renderLearnIt(slide, learnIt, satisfy, helpers) {
  const blocks = learnIt.blocks || [];
  if (!blocks.length) { satisfy(); return; }

  slide.innerHTML = `<div class="lw-eyebrow">📖 Learn It</div>`;
  const container = document.createElement('div');
  container.className = 'lw-body-stream';
  slide.appendChild(container);

  let idx = 0;
  function renderNext() {
    if (idx >= blocks.length) { satisfy(); return; }
    const block = blocks[idx];
    const blockEl = document.createElement('div');
    blockEl.className = 'lw-block-in';
    container.appendChild(blockEl);
    const advance = () => {
      idx += 1;
      renderNext();
      requestAnimationFrame(() => {
        const added = container.lastElementChild;
        if (added) added.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };
    if (block.type === 'breakdown') renderBreakdown(blockEl, block, advance);
    else if (block.type === 'dayli_says') renderDayliSays(blockEl, block, advance);
    else if (block.type === 'confusion') renderConfusion(blockEl, block, advance);
    else if (block.type === 'catch_mistake') renderCatchMistake(blockEl, block, advance, helpers);
    else advance();
  }
  renderNext();
}

/* ── See It: guided, staged canvas reveal ───────────────────────────── */

// Each drawer takes (ctx, w, h, stage, config, onDone): `stage` is the current
// See It stage or Try It round object (e.g. { part } for the candle/timeframe
// shapes, { path, highlight } for price_path, { show } for pnl_reveal,
// { layer } for the animated shapes below); `config` is the parent
// seeIt.config/tryIt.config, for lesson-wide data (a shared path, P&L
// inputs) that doesn't vary per stage. Most shapes draw synchronously and
// call onDone() immediately; the animated shapes run their own
// requestAnimationFrame loop and call onDone() once it settles. onDone is
// optional — Try It's click_chart doesn't pass one, since it doesn't gate
// on the draw finishing.
const GUIDED_DRAWERS = {
  candle_anatomy(ctx, w, h, stage, config, onDone) {
    const part = (stage && stage.part) || 'raw';
    const x = 390, open = 225, close = 145, high = 120, low = 245;
    drawFrame(ctx, w, h);
    drawCandle(ctx, x, open, close, high, low, true);
    ctx.strokeStyle = '#2C1810';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.fillStyle = '#2C1810';
    ctx.font = 'bold 13px DM Sans';
    function line(y, label) {
      ctx.beginPath(); ctx.moveTo(x + 30, y); ctx.lineTo(x + 116, y); ctx.stroke();
      ctx.fillText(label, x + 122, y + 4);
    }
    if (part === 'open' || part === 'all') line(open, 'Open: where price began');
    if (part === 'close' || part === 'all') line(close, 'Close: where price ended');
    if (part === 'high' || part === 'all') line(high, 'High: top of range');
    if (part === 'low' || part === 'all') line(low, 'Low: bottom of range');
    ctx.setLineDash([]);
    if (part === 'body' || part === 'all') {
      ctx.strokeStyle = '#F5A857'; ctx.lineWidth = 4;
      ctx.strokeRect(x - 30, close - 4, 60, Math.abs(close - open) + 8);
      ctx.fillStyle = '#2C1810'; ctx.fillText('Body: open to close', 130, 176);
    }
    if (part === 'wick' || part === 'all') {
      ctx.strokeStyle = '#F4829A'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(x, high); ctx.lineTo(x, close); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, open); ctx.lineTo(x, low); ctx.stroke();
      ctx.fillStyle = '#2C1810'; ctx.fillText('Wick: reached but did not close there', 80, 280);
    }
    if (part === 'raw') {
      ctx.fillStyle = '#2C1810'; ctx.font = 'bold 13px DM Sans';
      ctx.fillText('Here is one candle, unlabeled.', 60, 55);
    }
    if (onDone) onDone();
  },
  timeframe_lens(ctx, w, h, stage, config, onDone) {
    const part = (stage && stage.part) || '4H';
    const counts = { '4H': 5, '1H': 10, '15M': 18, '1M': 34 };
    const n = counts[part] || 5;
    drawFrame(ctx, w, h);
    const cw = Math.max(6, (w - 60) / n - 4);
    let y = h / 2;
    for (let i = 0; i < n; i++) {
      const move = Math.sin(i * 0.7 + n) * 26 + (Math.random() - 0.5) * 18;
      const bull = move >= 0 || Math.random() > 0.5;
      const open = y, close = y - move;
      const high = Math.min(open, close) - 8 - Math.random() * 10;
      const low = Math.max(open, close) + 8 + Math.random() * 10;
      drawCandle(ctx, 40 + i * (cw + 4) + cw / 2, open, close, high, low, bull, cw);
      y = close;
    }
    ctx.fillStyle = '#2C1810';
    ctx.font = 'bold 13px DM Sans';
    ctx.fillText(`${part} — ${n} candles shown`, 20, 24);
    if (onDone) onDone();
  },

  // A data-driven price path (no hardcoded coordinates) with an optional
  // single highlighted point — used for "where did control shift" lessons.
  // A stage/round can supply its own `path`, or fall back to config.path
  // when the whole See It sequence shares one continuous chart.
  price_path(ctx, w, h, stage, config, onDone) {
    const path = (stage && stage.path) || (config && config.path) || [[60, 220], [160, 140], [260, 180], [360, 90], [460, 150], [560, 60], [660, 110]];
    drawFrame(ctx, w, h);
    ctx.strokeStyle = '#2C1810';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    path.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.stroke();
    const highlight = stage && stage.highlight;
    if (highlight) {
      ctx.beginPath();
      ctx.arc(highlight.x, highlight.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = highlight.color || '#F4829A';
      ctx.fill();
      if (highlight.label) {
        ctx.fillStyle = '#2C1810';
        ctx.font = 'bold 13px DM Sans';
        ctx.fillText(highlight.label, highlight.x + 14, highlight.y - 12);
      }
    }
    if (onDone) onDone();
  },

  // Builds the P&L formula on-canvas one piece at a time. `config` carries
  // the fixed inputs for the whole lesson (points/pointValue/contracts);
  // each stage's `show` array says which lines are visible yet.
  pnl_reveal(ctx, w, h, stage, config, onDone) {
    const points = (config && config.points) || 30;
    const pointValue = (config && config.pointValue) || 2;
    const contracts = (config && config.contracts) || 3;
    const show = (stage && stage.show) || [];
    drawFrame(ctx, w, h);
    ctx.fillStyle = '#2C1810';
    ctx.font = 'bold 17px DM Sans';
    let y = 60;
    if (show.includes('points')) { ctx.fillText(`${points} points moved`, 40, y); y += 42; }
    if (show.includes('value')) { ctx.fillText(`× $${pointValue} per point`, 40, y); y += 42; }
    if (show.includes('contracts')) { ctx.fillText(`× ${contracts} contracts`, 40, y); y += 42; }
    if (show.includes('total')) {
      const total = points * pointValue * contracts;
      ctx.font = 'bold 36px DM Sans';
      ctx.fillStyle = '#1a6b63';
      ctx.fillText(`= $${total.toLocaleString()}`, 40, y + 22);
    }
    if (onDone) onDone();
  },

  // Animated: one evolving price line built up across 4 stages via
  // stage.layer = 'market' | 'direction' | 'risk' | 'outcome'. Earlier
  // layers redraw instantly (settled); the current layer animates in via
  // requestAnimationFrame — a progressive line draw, or a live-counting
  // "+$" number for the outcome layer.
  trade_anatomy(ctx, w, h, stage, config, onDone) {
    const cfg = config || {};
    const path = cfg.path || [[40, 210], [120, 200], [200, 205], [280, 185], [360, 190], [440, 160]];
    const ext = cfg.extension || [[440, 160], [520, 120], [600, 100], [680, 70]];
    const riskY = cfg.riskY != null ? cfg.riskY : path[path.length - 1][1] + 55;
    const outcomeValue = cfg.outcomeValue != null ? cfg.outcomeValue : 120;
    const layer = (stage && stage.layer) || 'market';
    const duration = 700;
    const start = performance.now();
    const entry = path[path.length - 1];
    const outcomePoint = ext[ext.length - 1];

    function lerpPath(points, t) {
      const segCount = points.length - 1;
      const totalT = Math.max(0, Math.min(1, t)) * segCount;
      const segIdx = Math.min(segCount - 1, Math.floor(totalT));
      const segT = totalT - segIdx;
      const out = points.slice(0, segIdx + 1);
      const [x0, y0] = points[segIdx];
      const [x1, y1] = points[segIdx + 1] || points[segIdx];
      out.push([x0 + (x1 - x0) * segT, y0 + (y1 - y0) * segT]);
      return out;
    }
    function drawLine(points, color, width) {
      if (points.length < 2) return;
      ctx.strokeStyle = color; ctx.lineWidth = width || 2.5;
      ctx.beginPath();
      points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.stroke();
    }

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      drawFrame(ctx, w, h);

      const marketT = layer === 'market' ? t : 1;
      drawLine(lerpPath(path, marketT), '#2C1810');
      if (layer === 'market') {
        if (t < 1) { requestAnimationFrame(frame); return; }
        if (onDone) onDone();
        return;
      }

      const dirT = layer === 'direction' ? t : 1;
      drawLine(lerpPath(ext, dirT), '#7ECEC4');
      if (layer === 'direction') {
        if (t >= 1) {
          ctx.fillStyle = '#7ECEC4'; ctx.font = 'bold 13px DM Sans';
          ctx.fillText('↑ LONG', outcomePoint[0] - 22, outcomePoint[1] - 14);
        }
        if (t < 1) { requestAnimationFrame(frame); return; }
        if (onDone) onDone();
        return;
      }

      const riskT = layer === 'risk' ? t : 1;
      if (riskT > 0) {
        const curX = entry[0] + (outcomePoint[0] - entry[0]) * riskT;
        ctx.fillStyle = 'rgba(244,130,154,.08)';
        ctx.fillRect(entry[0], entry[1], curX - entry[0], riskY - entry[1]);
        ctx.strokeStyle = '#F4829A'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(entry[0], riskY); ctx.lineTo(curX, riskY); ctx.stroke();
        ctx.setLineDash([]);
        if (riskT >= 1) {
          ctx.fillStyle = '#a84060'; ctx.font = 'bold 12px DM Sans';
          ctx.fillText('Risk / invalidation', entry[0], riskY + 18);
        }
      }
      if (layer === 'risk') {
        if (t < 1) { requestAnimationFrame(frame); return; }
        if (onDone) onDone();
        return;
      }

      if (layer === 'outcome') {
        const val = Math.round(outcomeValue * t);
        ctx.beginPath(); ctx.arc(outcomePoint[0], outcomePoint[1], 5, 0, Math.PI * 2);
        ctx.fillStyle = '#7ECEC4'; ctx.fill();
        ctx.font = 'bold 22px DM Sans'; ctx.fillStyle = '#1a6b63';
        ctx.fillText(`+$${val}`, outcomePoint[0] - 26, outcomePoint[1] - 18);
        if (t < 1) { requestAnimationFrame(frame); return; }
        if (onDone) onDone();
        return;
      }

      if (onDone) onDone();
    }
    requestAnimationFrame(frame);
  },

  // Animated: a buyer bubble and a seller bubble slide in from opposite
  // edges, then slide toward each other and meet with a burst — visualizing
  // "disagreement creates a transaction" instead of describing it. Layers:
  // 'buyer' | 'seller' | 'meet' | 'transaction'.
  market_disagreement(ctx, w, h, stage, config, onDone) {
    const midY = h / 2;
    const buyerStart = 60, buyerSettled = w * 0.32;
    const sellerStart = w - 60, sellerSettled = w * 0.68;
    const meetX = w / 2;
    const layer = (stage && stage.layer) || 'buyer';
    const duration = 650;
    const start = performance.now();

    function drawBubble(x, y, r, color, label, sublabel) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 13px DM Sans'; ctx.textAlign = 'center';
      ctx.fillText(label, x, y + 5);
      if (sublabel) {
        ctx.fillStyle = '#2C1810'; ctx.font = '12px DM Sans';
        ctx.fillText(sublabel, x, y + r + 22);
      }
      ctx.textAlign = 'left';
    }

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      drawFrame(ctx, w, h);
      ctx.strokeStyle = 'rgba(44,24,16,.15)'; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(w, midY); ctx.stroke(); ctx.setLineDash([]);

      let buyerX = buyerSettled, sellerX = sellerSettled;
      if (layer === 'buyer') buyerX = buyerStart + (buyerSettled - buyerStart) * t;
      if (layer === 'meet') buyerX = buyerSettled + (meetX - 42 - buyerSettled) * t;
      if (layer === 'transaction') buyerX = meetX - 42;
      if (layer === 'seller') sellerX = sellerStart + (sellerSettled - sellerStart) * t;
      if (layer === 'meet') sellerX = sellerSettled + (meetX + 42 - sellerSettled) * t;
      if (layer === 'transaction') sellerX = meetX + 42;

      const buyerVisible = layer !== 'buyer' || t >= 0;
      if (buyerVisible) drawBubble(buyerX, midY, 34, '#7ECEC4', 'BUYER', layer === 'buyer' && t >= 1 ? '"I want in here"' : null);
      if (layer !== 'buyer') drawBubble(sellerX, midY, 34, '#F4829A', 'SELLER', layer === 'seller' && t >= 1 ? '"I\'m willing to sell"' : null);

      if (layer === 'transaction') {
        const burstR = 10 + 34 * t;
        ctx.beginPath(); ctx.arc(meetX, midY, burstR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245,168,87,${1 - t})`; ctx.lineWidth = 3; ctx.stroke();
        if (t >= 1) {
          ctx.fillStyle = '#F5A857'; ctx.font = 'bold 14px DM Sans'; ctx.textAlign = 'center';
          ctx.fillText('✦ TRANSACTION', meetX, midY - 56);
          ctx.textAlign = 'left';
        }
      }

      if (t < 1) { requestAnimationFrame(frame); return; }
      if (onDone) onDone();
    }
    requestAnimationFrame(frame);
  },

  // Animated: bar-growth comparison, one instrument pair per stage — the
  // micro bar stays constant while the mini bar visibly grows to scale.
  // config.pairs = [{ small, big, ratio }, ...]. Layers match pair keys
  // ('mnq'/'mes'/'mgc' by default) plus a closing 'summary' layer.
  instrument_compare(ctx, w, h, stage, config, onDone) {
    const pairs = (config && config.pairs) || [
      { key: 'mnq', small: 'MNQ', big: 'NQ', ratio: 10 },
      { key: 'mes', small: 'MES', big: 'ES', ratio: 10 },
      { key: 'mgc', small: 'MGC', big: 'GC', ratio: 10 },
    ];
    const layer = (stage && stage.layer) || pairs[0].key;
    const duration = 650;
    const start = performance.now();
    const barBaseY = h - 60, unitH = 16, barW = 64;

    function drawPair(cx, p, growT) {
      const smallH = unitH;
      ctx.fillStyle = '#B2E4DF';
      ctx.fillRect(cx - barW - 12, barBaseY - smallH, barW, smallH);
      ctx.fillStyle = '#2C1810'; ctx.font = 'bold 12px DM Sans'; ctx.textAlign = 'center';
      ctx.fillText(p.small, cx - barW / 2 - 12, barBaseY + 18);

      const grownH = unitH * (1 + (p.ratio - 1) * growT);
      ctx.fillStyle = '#F9B8C6';
      ctx.fillRect(cx + 12, barBaseY - grownH, barW, grownH);
      ctx.fillText(p.big, cx + barW / 2 + 12, barBaseY + 18);
      ctx.textAlign = 'left';
    }

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      drawFrame(ctx, w, h);

      if (layer === 'summary') {
        const slotW = (w - 80) / pairs.length;
        pairs.forEach((p, i) => drawPair(60 + slotW * i + slotW / 2, p, 1));
        ctx.fillStyle = '#2C1810'; ctx.font = 'bold 13px DM Sans'; ctx.textAlign = 'center';
        ctx.fillText('Micro contracts are a fraction of their mini counterparts', w / 2, 30);
        ctx.textAlign = 'left';
        if (onDone) onDone();
        return;
      }

      const p = pairs.find((x) => x.key === layer) || pairs[0];
      drawPair(w / 2, p, t);
      ctx.fillStyle = '#2C1810'; ctx.font = 'bold 13px DM Sans'; ctx.textAlign = 'center';
      ctx.fillText(`${p.small} is 1/${p.ratio} the size of ${p.big}`, w / 2, 30);
      ctx.textAlign = 'left';

      if (t < 1) { requestAnimationFrame(frame); return; }
      if (onDone) onDone();
    }
    requestAnimationFrame(frame);
  },

  // Animated: a two-column canvas (a stocks side and a futures side) whose
  // bullet points animate in line by line — stocks column first, then
  // futures. Layers: 'stocks' | 'futures' | 'terms' | 'matters' (the last
  // two keep both columns settled and let the caption carry the point).
  stocks_vs_futures(ctx, w, h, stage, config, onDone) {
    const cfg = config || {};
    const stockPoints = cfg.stockPoints || ['Shares / equity', 'No expiration', 'Regular + extended hours'];
    const futuresPoints = cfg.futuresPoints || ['Standardized contracts', 'Contracts expire — rollover', 'Nearly 24hr weekday trading'];
    const layer = (stage && stage.layer) || 'stocks';
    const duration = 600;
    const start = performance.now();

    function drawColumn(x, title, points, color, revealCount) {
      ctx.fillStyle = color; ctx.font = 'bold 15px DM Sans';
      ctx.fillText(title, x, 34);
      for (let i = 0; i < revealCount; i++) {
        ctx.fillStyle = '#3D2B20'; ctx.font = '12px DM Sans';
        ctx.fillText('• ' + points[i], x, 66 + i * 28);
      }
    }

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      drawFrame(ctx, w, h);
      ctx.strokeStyle = 'rgba(44,24,16,.12)';
      ctx.beginPath(); ctx.moveTo(w / 2, 10); ctx.lineTo(w / 2, h - 10); ctx.stroke();

      const stockReveal = layer === 'stocks' ? Math.ceil(stockPoints.length * t) : (layer === 'futures' || layer === 'terms' || layer === 'matters' ? stockPoints.length : 0);
      drawColumn(24, 'STOCKS', stockPoints, '#F4829A', stockReveal);

      const futuresReveal = layer === 'futures' ? Math.ceil(futuresPoints.length * t) : (layer === 'terms' || layer === 'matters' ? futuresPoints.length : 0);
      drawColumn(w / 2 + 24, 'FUTURES', futuresPoints, '#7ECEC4', futuresReveal);

      if ((layer === 'stocks' || layer === 'futures') && t < 1) { requestAnimationFrame(frame); return; }
      if (onDone) onDone();
    }
    requestAnimationFrame(frame);
  },
};

function renderSeeIt(slide, seeIt, satisfy, helpers) {
  if (seeIt.mode === 'cards') renderCardsSeeIt(slide, seeIt, satisfy, helpers);
  else renderGuidedReveal(slide, seeIt, satisfy, helpers);
}

function renderGuidedReveal(slide, seeIt, satisfy, helpers) {
  const stages = (seeIt.config && seeIt.config.stages) || [];
  if (!stages.length) { satisfy(); return; }

  const uid = `si${uidCounter++}`;
  slide.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">👁️ See It</div>
      <h2>${seeIt.heading || 'Watch it happen'}</h2>
      ${seeIt.prompt ? `<p>${seeIt.prompt}</p>` : ''}
      <div class="lw-chartbox">
        <canvas id="dlCanvas_${uid}" class="lw-chart dl-canvas" width="780" height="320"></canvas>
        <div class="dl-reveal-caption" id="dlCaption_${uid}"></div>
        <div class="dl-reveal-dots" id="dlDots_${uid}"></div>
      </div>
    </div>
    <div class="lw-continue-wrap" id="dlCont_${uid}"></div>
  `;
  const canvas = document.getElementById(`dlCanvas_${uid}`);
  const ctx = canvas.getContext('2d');
  const captionEl = document.getElementById(`dlCaption_${uid}`);
  const dotsEl = document.getElementById(`dlDots_${uid}`);
  const contWrap = document.getElementById(`dlCont_${uid}`);
  const drawFn = GUIDED_DRAWERS[seeIt.config && seeIt.config.shape] || GUIDED_DRAWERS.candle_anatomy;

  let idx = 0;

  function renderDots() {
    dotsEl.innerHTML = stages.map((_, i) => `<span class="dl-reveal-dot ${i === idx ? 'active' : i < idx ? 'done' : ''}"></span>`).join('');
  }

  function showStage() {
    const stage = stages[idx];
    renderDots();
    contWrap.innerHTML = '';
    captionEl.classList.remove('show');
    captionEl.textContent = '';
    canvas.classList.remove('dl-canvas-fade');
    void canvas.offsetWidth;
    canvas.classList.add('dl-canvas-fade');

    // Non-animated shapes call onDone() synchronously (no visible delay);
    // animated shapes run their own requestAnimationFrame loop first — the
    // caption and Continue button only appear once the reveal settles.
    drawFn(ctx, canvas.width, canvas.height, stage, seeIt.config, () => {
      captionEl.textContent = stage.caption || '';
      requestAnimationFrame(() => captionEl.classList.add('show'));

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lw-continue-btn';
      btn.textContent = idx === stages.length - 1 ? 'Continue →' : 'Next →';
      btn.addEventListener('click', () => {
        idx += 1;
        if (idx >= stages.length) { helpers.handleStreak(true); satisfy(); return; }
        showStage();
      });
      contWrap.appendChild(btn);
    });
  }

  showStage();
}

// See It, non-canvas variant: a staged reveal of simple labeled concept
// cards, stacking up as each is revealed — the better fit for prose-heavy
// ideas (a comparison, a list, a build-up of concepts) than a canvas.
function renderCardsSeeIt(slide, seeIt, satisfy, helpers) {
  const cards = (seeIt.config && seeIt.config.cards) || [];
  if (!cards.length) { satisfy(); return; }

  slide.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">👁️ See It</div>
      <h2>${seeIt.heading || 'Watch it happen'}</h2>
      ${seeIt.prompt ? `<p>${seeIt.prompt}</p>` : ''}
      <div id="dlCardStack"></div>
      <div class="dl-reveal-dots" id="dlCardDots"></div>
    </div>
    <div class="lw-continue-wrap" id="dlCardCont"></div>
  `;
  const stackEl = document.getElementById('dlCardStack');
  const dotsEl = document.getElementById('dlCardDots');
  const contWrap = document.getElementById('dlCardCont');

  let idx = 0;

  function renderDots() {
    dotsEl.innerHTML = cards.map((_, i) => `<span class="dl-reveal-dot ${i === idx ? 'active' : i < idx ? 'done' : ''}"></span>`).join('');
  }

  function showCard() {
    const card = cards[idx];
    const el = document.createElement('div');
    el.className = 'dl-concept-card';
    el.innerHTML = `
      ${card.label ? `<div class="dl-concept-label">${card.label}</div>` : ''}
      <div class="dl-concept-text">${card.text}</div>
    `;
    stackEl.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    renderDots();

    contWrap.innerHTML = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lw-continue-btn';
    btn.textContent = idx === cards.length - 1 ? 'Continue →' : 'Next →';
    btn.addEventListener('click', () => {
      idx += 1;
      if (idx >= cards.length) { helpers.handleStreak(true); satisfy(); return; }
      showCard();
    });
    contWrap.appendChild(btn);
  }

  showCard();
}

/* ── Try It: click-on-chart, one-decision-at-a-time path, or MC rounds ── */

function renderTryIt(slide, tryIt, satisfy, helpers) {
  if (tryIt.mode === 'decision_path') renderDecisionPath(slide, tryIt, satisfy, helpers);
  else if (tryIt.mode === 'choice_rounds') renderChoiceRounds(slide, tryIt, satisfy, helpers);
  else renderClickChart(slide, tryIt, satisfy, helpers);
}

function renderClickChart(slide, tryIt, satisfy, helpers) {
  const cfg = tryIt.config || {};
  const shape = cfg.shape || 'candle_anatomy';
  // Multi-round: config.rounds[] = [{ prompt, part, points: [...] }, ...]. Falls back to
  // the old flat points/tryIt.prompt shape as a single round for backward compatibility.
  const rounds = cfg.rounds && cfg.rounds.length ? cfg.rounds : [{ prompt: tryIt.prompt, part: cfg.part, points: cfg.points || [] }];

  let idx = 0;
  let solved = false;
  let currentPoints = [];

  slide.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">🎯 Try It</div>
      <h2>${tryIt.heading || 'Tap it on the chart'}</h2>
      <p id="dlTryPrompt"></p>
      ${rounds.length > 1 ? '<div class="dl-reveal-dots" id="dlTryDots"></div>' : ''}
      <div class="lw-chartbox">
        <canvas id="dlTryCanvas" class="lw-chart" width="780" height="320" style="cursor:pointer"></canvas>
      </div>
      <div class="lw-opts" id="dlTryOpts"></div>
      <div class="lw-continue-wrap" id="dlTryNav"></div>
    </div>
    <div class="lw-feedback" id="dlTryFb"></div>
  `;
  const canvas = document.getElementById('dlTryCanvas');
  const ctx = canvas.getContext('2d');
  const fb = document.getElementById('dlTryFb');
  const promptEl = document.getElementById('dlTryPrompt');
  const dotsEl = document.getElementById('dlTryDots');
  const optsEl = document.getElementById('dlTryOpts');
  const navEl = document.getElementById('dlTryNav');
  const drawFn = GUIDED_DRAWERS[shape] || GUIDED_DRAWERS.candle_anatomy;

  function renderDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = rounds.map((_, i) => `<span class="dl-reveal-dot ${i === idx ? 'active' : i < idx ? 'done' : ''}"></span>`).join('');
  }

  function loadRound() {
    const round = rounds[idx];
    currentPoints = round.points || [];
    solved = false;
    navEl.innerHTML = '';
    fb.className = 'lw-feedback';
    fb.textContent = '';
    promptEl.textContent = round.prompt || '';
    renderDots();
    drawFn(ctx, canvas.width, canvas.height, { ...round, part: round.part || cfg.part || 'raw' }, cfg);
    optsEl.innerHTML = currentPoints.map((p, i) => `<button type="button" class="lw-qopt" data-i="${i}">${p.label}</button>`).join('');
    optsEl.querySelectorAll('.lw-qopt').forEach((btn, i) => {
      btn.addEventListener('click', () => attempt(currentPoints[i], btn));
    });
  }

  function attempt(point, el) {
    if (solved || !point) return;
    if (point.correct) {
      solved = true;
      if (el) el.classList.add('correct');
      fb.innerHTML = `<strong>✦ Why?</strong> ${point.feedback || 'Exactly!'}`;
      fb.className = 'lw-feedback show good';
      helpers.handleStreak(true);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lw-continue-btn';
      if (idx < rounds.length - 1) {
        btn.textContent = 'Next part →';
        btn.addEventListener('click', () => { idx += 1; loadRound(); });
      } else {
        helpers.burst();
        btn.textContent = 'Continue →';
        btn.addEventListener('click', satisfy);
      }
      navEl.appendChild(btn);
    } else {
      if (el) el.classList.add('wrong');
      fb.textContent = point.feedback || 'Not quite — look again.';
      fb.className = 'lw-feedback show bad';
      helpers.handleStreak(false);
    }
  }

  canvas.addEventListener('click', (e) => {
    if (solved) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX, y = (e.clientY - rect.top) * scaleY;
    let nearest = null, nearestDist = Infinity;
    currentPoints.forEach((p) => {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < (p.r || 40) && d < nearestDist) { nearest = p; nearestDist = d; }
    });
    if (nearest) attempt(nearest, null);
  });

  loadRound();
}

function renderDecisionPath(slide, tryIt, satisfy, helpers) {
  const nodes = tryIt.nodes || [];
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  let currentId = tryIt.startNode || (nodes[0] && nodes[0].id);

  slide.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">🧭 Try It</div>
      <h2>${tryIt.heading || 'What would you do?'}</h2>
      ${tryIt.prompt ? `<p class="lw-scenario">${tryIt.prompt}</p>` : ''}
      <div id="dlDecisionBody"></div>
    </div>
  `;
  const body = document.getElementById('dlDecisionBody');

  function renderNode() {
    const node = byId[currentId];
    if (!node) { satisfy(); return; }
    body.innerHTML = `
      <div class="dl-decision-card">
        <div class="dl-decision-q">${node.prompt}</div>
        <div class="lw-opts">
          ${node.options.map((o, i) => `<button type="button" class="lw-qopt" data-i="${i}">${o.label}</button>`).join('')}
        </div>
        <div class="lw-feedback" id="dlDecisionFb"></div>
      </div>
    `;
    const fb = document.getElementById('dlDecisionFb');
    const buttons = body.querySelectorAll('.lw-qopt');
    let picked = false;
    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        if (picked) return;
        picked = true;
        const opt = node.options[i];
        buttons.forEach((b) => { if (b !== btn) b.disabled = true; });
        btn.classList.add(opt.good ? 'correct' : 'wrong');
        fb.innerHTML = opt.feedback || '';
        fb.className = 'lw-feedback show ' + (opt.good ? 'good' : 'bad');
        helpers.handleStreak(!!opt.good);
        const cont = document.createElement('button');
        cont.type = 'button';
        cont.className = 'lw-continue-btn';
        cont.textContent = opt.next ? 'Continue →' : 'See outcome →';
        cont.addEventListener('click', () => {
          if (opt.next) { currentId = opt.next; renderNode(); }
          else renderOutcome(opt.outcomeText || opt.feedback || '');
        });
        body.appendChild(cont);
      });
    });
  }

  function renderOutcome(text) {
    body.innerHTML = `
      <div class="dl-decision-outcome">
        <div class="lw-eyebrow">Outcome</div>
        <p>${text}</p>
      </div>
    `;
    helpers.burst();
    appendLoopContinue(slide, satisfy);
  }

  renderNode();
}

// Try It, no-chart variant: sequential multiple-choice rounds via buttons —
// the fit for lessons whose questions are reasoning-based rather than
// chart-identification. Reuses wireRetryOptions (retry-until-correct with
// per-option "why"/feedback) round by round instead of one flat quiz.
function renderChoiceRounds(slide, tryIt, satisfy, helpers) {
  const rounds = tryIt.rounds || [];
  if (!rounds.length) { satisfy(); return; }

  let idx = 0;

  slide.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">🎯 Try It</div>
      <h2>${tryIt.heading || 'What would you say?'}</h2>
      ${rounds.length > 1 ? '<div class="dl-reveal-dots" id="dlCrDots"></div>' : ''}
      <div id="dlCrBody"></div>
    </div>
  `;
  const body = document.getElementById('dlCrBody');
  const dotsEl = document.getElementById('dlCrDots');

  function renderDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = rounds.map((_, i) => `<span class="dl-reveal-dot ${i === idx ? 'active' : i < idx ? 'done' : ''}"></span>`).join('');
  }

  function loadRound() {
    const round = rounds[idx];
    renderDots();
    body.innerHTML = `
      ${round.scenario ? `<p class="lw-scenario">${round.scenario}</p>` : ''}
      <div class="lw-q-text">${round.question}</div>
      <div class="lw-opts" id="dlCrOpts">
        ${round.options.map((o, i) => `<button type="button" class="lw-qopt" data-i="${i}">${o.label}</button>`).join('')}
      </div>
      <div class="lw-feedback" id="dlCrFb"></div>
    `;
    const fb = document.getElementById('dlCrFb');
    const buttons = body.querySelectorAll('.lw-qopt');
    wireRetryOptions(buttons, round.options, fb, () => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lw-continue-btn';
      if (idx < rounds.length - 1) {
        btn.textContent = 'Next →';
        btn.addEventListener('click', () => { idx += 1; loadRound(); });
      } else {
        helpers.burst();
        btn.textContent = 'Continue →';
        btn.addEventListener('click', satisfy);
      }
      body.appendChild(btn);
    }, helpers.handleStreak);
  }

  loadRound();
}

/* ── Say It Back: teach-it-back + self-compare against a model answer ── */

function renderSayItBack(slide, sayItBack, lessonId, satisfy) {
  slide.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">💬 Say It Back</div>
      <h2>In your own words</h2>
      <p>${sayItBack.prompt || ''}</p>
      <textarea class="lw-reflect-textarea" id="dlSayInput" rows="4" placeholder="Type it how YOU understand it..."></textarea>
      <button type="button" class="lw-continue-btn" id="dlCompareBtn" disabled>Compare to model answer →</button>
      <div class="dl-say-compare" id="dlSayCompare" style="display:none">
        <div class="dl-model-answer"><div class="lw-eyebrow">Model answer</div><p>${sayItBack.modelAnswer || ''}</p></div>
        <div class="dl-say-selfmark">
          <button type="button" class="lw-qopt" id="dlMatchBtn">✓ My answer covers this</button>
          <button type="button" class="lw-qopt" id="dlReviseBtn">↻ I want to revise</button>
        </div>
      </div>
      <div class="lw-reflect-saved" id="dlSaySaved" style="display:none">✓ Saved to My Notes</div>
    </div>
  `;
  const input = slide.querySelector('#dlSayInput');
  const compareBtn = slide.querySelector('#dlCompareBtn');
  const compareBox = slide.querySelector('#dlSayCompare');

  input.addEventListener('input', () => { compareBtn.disabled = input.value.trim().length < 5; });
  compareBtn.addEventListener('click', () => {
    compareBox.style.display = '';
    compareBtn.disabled = true;
  });

  function save(selfMark) {
    try {
      const key = 'aghf_notes';
      const notes = JSON.parse(localStorage.getItem(key) || '[]');
      notes.push({ lessonId, prompt: sayItBack.prompt, text: input.value.trim(), selfMark, savedAt: Date.now() });
      localStorage.setItem(key, JSON.stringify(notes));
    } catch (err) { console.error('Note save error:', err); }
    slide.querySelector('#dlSaySaved').style.display = '';
    input.disabled = true;
    satisfy();
  }
  slide.querySelector('#dlMatchBtn').addEventListener('click', () => save('match'));
  slide.querySelector('#dlReviseBtn').addEventListener('click', () => save('revise'));
}

/* ── Save It: playbook card, saved + downloadable, doubles as Complete ─ */

function renderSaveIt(slide, data, { lessonId, nextHref, backHref, nextTitle, nextHook, nextCtaLabel }) {
  const checklist = (data.saveIt && data.saveIt.checklist) || data.takeaways || [];
  slide.innerHTML = `
    <div class="lw-card dl-playbook-card" id="dlPlaybookCard">
      <div class="lw-eyebrow">🎀 Save It</div>
      <h2>${data.title}</h2>
      <div class="dl-playbook-checklist">
        ${checklist.map((c) => `<div class="lw-takeaway dl-playbook-item">✓ ${c}</div>`).join('')}
      </div>
      ${data.remember ? `<div class="lw-remember dl-playbook-remember"><div class="lw-remember-label">🎀 One Thing to Remember</div><div class="lw-remember-text dl-playbook-remember-text">${data.remember}</div></div>` : ''}
      <div class="lw-badge dl-playbook-badge">+${data.xpValue} GP</div>
    </div>
    <div class="dl-playbook-actions">
      <button type="button" class="lw-continue-btn" id="dlSaveToPlaybook">✓ Save to My Playbook</button>
      <button type="button" class="lw-continue-btn dl-download-btn" id="dlDownloadCard">⬇ Download as image</button>
    </div>
    ${nextTitle ? `
    <div class="lw-card lw-next-up">
      <div class="lw-eyebrow">Next up</div>
      <h2>${nextTitle}</h2>
      ${nextHook ? `<p class="lw-hook-text">"${nextHook}"</p>` : ''}
      <button type="button" class="lw-cc-next" id="dlNextLessonBtn">${nextCtaLabel || 'Start Next Lesson →'}</button>
    </div>` : `
    <div class="lw-card" style="text-align:center">
      <button type="button" class="lw-cc-next" id="dlNextLessonBtn">Back to Lessons →</button>
    </div>`}
    <div class="lw-back-link"><a href="${backHref}">← Back to all lessons</a></div>
  `;
  document.getElementById('dlSaveToPlaybook').addEventListener('click', (e) => {
    try {
      const key = 'aghf_playbook';
      const cards = JSON.parse(localStorage.getItem(key) || '[]');
      cards.push({ lessonId, title: data.title, checklist, remember: data.remember, savedAt: Date.now() });
      localStorage.setItem(key, JSON.stringify(cards));
    } catch (err) { console.error('Playbook save error:', err); }
    e.currentTarget.textContent = '✓ Saved to My Playbook';
    e.currentTarget.disabled = true;
  });
  document.getElementById('dlDownloadCard').addEventListener('click', () => {
    if (typeof window.html2canvas !== 'function') return;
    window.html2canvas(document.getElementById('dlPlaybookCard'), { backgroundColor: '#FDF8F5', scale: 3 }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `${lessonId}-playbook-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  });
  document.getElementById('dlNextLessonBtn').addEventListener('click', () => { window.location.href = nextHref || backHref; });
}
