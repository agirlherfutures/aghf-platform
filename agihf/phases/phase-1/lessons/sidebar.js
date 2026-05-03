/**
 * sidebar.js — A Girl & Her Futures™
 * Place this file at: agihf/phases/phase-1/lessons/sidebar.js
 *
 * Wires up all sidebar nav links so they work from any lesson page in this folder.
 * The dashboard (index.html) is 3 levels up: ../../../index.html
 */

(function () {

  /* ── Path helpers ─────────────────────────────────────────── */
  const ROOT     = '../../../../';       // → repo root (where index.html lives)
  const LESSONS  = './';                 // → agihf/phases/phase-1/lessons/

  /* ── Lesson manifest (Phase 1 only — extend as phases grow) ── */
  const LESSON_URLS = [
    'PHASE_1_LESSON_1_What_is_trading_.html',
    'PHASE_1_LESSON_2_Why_do_markets_exist_.html',
    'PHASE_1_LESSON_3_Buyers_vs_Sellers_.html',
    'PHASE_1_LESSON_4_Contracts_Instruments.html',
    'PHASE_1_LESSON_5_Futures_vs_Stocks.html',
    'PHASE_1_LESSON_6_Points_Ticks_PL.html',
    'PHASE_1_LESSON_7_TradingView_Basics.html',
    'PHASE_1_LESSON_8_Reading_Candles.html',
    'PHASE_1_LESSON_9_Timeframes.html',
    'PHASE_1_LESSON_10_Support_Resistance.html',
    'PHASE_1_LESSON_11_Swing_Highs_Lows.html',
    'PHASE_1_LESSON_12_Trend_Structure.html',
    'PHASE_1_LESSON_13_Consolidation.html',
    'PHASE_1_LESSON_14_Liquidity_Basics.html',
    'PHASE_1_LESSON_15_ICC_Indication.html',
    'PHASE_1_LESSON_16_ICC_Correction.html',
    'PHASE_1_LESSON_17_ICC_Continuation.html',
  ];

  /* ── Figure out which lesson we're on ────────────────────── */
  const currentFile = window.location.pathname.split('/').pop();
  const currentIdx  = LESSON_URLS.indexOf(currentFile);

  /* ── Wire sidebar nav items ──────────────────────────────── */
  function wireNav() {
    // Logo → dashboard
    document.querySelectorAll('.sb-logo').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => { window.location.href = ROOT + 'index.html'; });
    });

    // "Lessons" nav item → dashboard (lessons tab)
    document.querySelectorAll('.sb-item').forEach(el => {
      const text = el.textContent.trim();

      if (text.includes('Lessons')) {
        el.addEventListener('click', () => {
          window.location.href = ROOT + 'index.html';
        });
      }
      if (text.includes('Games')) {
        el.addEventListener('click', () => {
          // Future: window.location.href = ROOT + 'games.html';
          showComingSoon('Games are coming soon! Focus on the lessons for now. ✦');
        });
      }
      if (text.includes('Leaderboard')) {
        el.addEventListener('click', () => {
          showComingSoon('Leaderboard is coming soon! ✦');
        });
      }
      if (text.includes('Drip Store')) {
        el.addEventListener('click', () => {
          showComingSoon('Drip Store is coming soon! ✦');
        });
      }
      if (text.includes('Profile')) {
        el.addEventListener('click', () => {
          window.location.href = ROOT + 'index.html';
        });
      }
    });

    // Breadcrumb "Lessons" link in topbar
    document.querySelectorAll('.tbar-bc a, .crumb a').forEach(el => {
      if (el.textContent.trim().toLowerCase().includes('lesson')) {
        el.href = ROOT + 'index.html';
      }
    });
  }

  /* ── Wire completion buttons ─────────────────────────────── */
  function wireCompletionButtons() {
    const nextIdx = currentIdx + 1;
    const nextUrl = nextIdx >= 0 && nextIdx < LESSON_URLS.length
      ? LESSONS + LESSON_URLS[nextIdx]
      : null;

    // Lesson 1 uses .btn.primary inside .complete-btns
    document.querySelectorAll('.complete-btns .btn.primary, .complete-btns .btn-primary').forEach(btn => {
      if (nextUrl) {
        btn.onclick = () => { window.location.href = nextUrl; };
        if (btn.textContent.includes('Lesson')) {
          const num = currentIdx + 2;
          btn.textContent = `Lesson ${num} →`;
        }
      } else {
        btn.onclick = () => { window.location.href = ROOT + 'index.html'; };
        btn.textContent = 'Back to lessons →';
      }
    });

    // Lesson 1 ghost "Back to lessons" button
    document.querySelectorAll('.complete-btns .btn.ghost').forEach(btn => {
      btn.onclick = () => { window.location.href = ROOT + 'index.html'; };
      btn.textContent = '← Back to lessons';
    });

    // Lessons 2 & 3 use .cc-next and .cc-hub
    document.querySelectorAll('.cc-next').forEach(btn => {
      if (nextUrl) {
        btn.onclick = () => { window.location.href = nextUrl; };
        const num = currentIdx + 2;
        btn.textContent = `Lesson ${num} →`;
      } else {
        btn.onclick = () => { window.location.href = ROOT + 'index.html'; };
        btn.textContent = 'Back to lessons →';
      }
    });

    document.querySelectorAll('.cc-hub').forEach(btn => {
      btn.onclick = () => { window.location.href = ROOT + 'index.html'; };
      btn.textContent = '← Back to lessons';
    });
  }

  /* ── Highlight active sidebar item ──────────────────────── */
  function setActiveLesson() {
    document.querySelectorAll('.sb-item').forEach(el => {
      if (el.textContent.trim().includes('Lessons')) {
        el.classList.add('on');
      }
    });
  }

  /* ── Toast for coming-soon features ─────────────────────── */
  function showComingSoon(msg) {
    let toast = document.getElementById('_sidebar_toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = '_sidebar_toast';
      toast.style.cssText = `
        position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);
        background:#2C1810;color:#fff;padding:12px 22px;border-radius:14px;
        font-family:'DM Sans',sans-serif;font-size:.83rem;font-weight:500;
        box-shadow:0 12px 40px rgba(44,24,16,.35);z-index:9999;
        opacity:0;transition:all .35s ease;pointer-events:none;white-space:nowrap;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2200);
  }

  /* ── Run everything on DOM ready ─────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    wireNav();
    wireCompletionButtons();
    setActiveLesson();
  }

})();
