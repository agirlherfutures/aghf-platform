/**
 * sidebar.js — A Girl & Her Futures™
 * Place this file at: agihf/phases/phase-1/lessons/sidebar.js
 *
 * Automatically injects the dark navy sidebar styles AND wires up all
 * navigation for every lesson page. Just add <script src="sidebar.js"></script>
 * before </body> in any new lesson file — nothing else needed.
 */

(function () {

  /* ── Path helpers ─────────────────────────────────────────── */
  const ROOT    = '../../../../';   // → repo root (where index.html lives)
  const LESSONS = './';             // → this lessons folder

  /* ── Lesson manifest — add new lessons to the bottom ──────── */
  const LESSON_URLS = [
    'lesson-01-what-is-trading.html',
    'lesson-02-why-markets-exist.html',
    'lesson-03-buyers-vs-sellers.html',
    'lesson-04-contracts-instruments.html',
    'lesson-05-futures-vs-stocks.html',
    'lesson-06-how-traders-get-paid.html',
    'lesson-07-tradingview-basics.html',
    'lesson-08-timeframes-perspective.html',
    'lesson-09-brokers-prop-firms.html',
    'lesson-10-orders-how-you-enter.html',
    'lesson-11-stop-loss-take-profit.html',
    'lesson-12-position-sizing.html',
    'lesson-13-candle-psychology.html',
    'lesson-14-candle-anatomy.html',
    'lesson-15-candle-psychology-2.html',
    'lesson-16-timeframes.html',
    'lesson-17-multi-timeframes.html',
    // Add new lessons below this line:
  ];

  /* ── Inject dark navy sidebar CSS ────────────────────────── */
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .sidebar {
        width: 230px;
        flex-shrink: 0;
        background: #2C1810 !important;
        border-right: none !important;
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 0; left: 0; bottom: 0;
        z-index: 50;
        overflow-y: auto;
      }
      .sb-logo {
        padding: 22px 22px 16px;
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 1rem;
        color: #F4829A !important;
        border-bottom: 1px solid rgba(255,255,255,.08) !important;
        cursor: pointer;
        display: block;
        text-decoration: none;
      }
      .sb-logo span { color: #7ECEC4 !important; }
      .sb-user {
        padding: 13px 18px;
        display: flex;
        align-items: center;
        gap: 10px;
        border-bottom: 1px solid rgba(255,255,255,.08) !important;
        margin-bottom: 6px;
      }
      .sb-av {
        width: 36px; height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #F4829A, #F5A857) !important;
        border: 2px solid rgba(255,255,255,.2) !important;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Playfair Display', serif;
        font-size: .85rem; font-weight: 700;
        color: white !important;
        flex-shrink: 0;
      }
      .sb-nm { font-size: .84rem; font-weight: 600; color: white !important; }
      .sb-lv { font-size: .68rem; color: rgba(255,255,255,.45) !important; }
      .sb-sec {
        font-size: .62rem; font-weight: 500;
        letter-spacing: .1em; text-transform: uppercase;
        color: rgba(255,255,255,.3) !important;
        padding: 12px 18px 5px;
      }
      .sb-item {
        display: flex; align-items: center; gap: 9px;
        padding: 10px 18px;
        font-size: .85rem;
        color: rgba(255,255,255,.55) !important;
        cursor: pointer;
        transition: all .2s;
        border-left: 3px solid transparent !important;
        background: transparent !important;
      }
      .sb-item:hover {
        color: white !important;
        background: rgba(255,255,255,.07) !important;
      }
      .sb-item.on, .sb-item.active {
        color: #F4829A !important;
        background: rgba(244,130,154,.12) !important;
        border-left-color: #F4829A !important;
        font-weight: 500;
      }
      .sb-ico { width: 16px; text-align: center; font-size: 12px; flex-shrink: 0; }
      .sb-bot {
        margin-top: auto;
        padding: 14px 18px;
        border-top: 1px solid rgba(255,255,255,.08) !important;
      }
      .xpb, .xp-box, .xpbox .xpb {
        background: rgba(255,255,255,.06) !important;
        border-radius: 12px;
        padding: 12px 14px;
      }
      .xpb-top, .xp-top {
        display: flex; justify-content: space-between; margin-bottom: 7px;
      }
      .xpb-l, .xp-lbl { font-size: .68rem; color: rgba(255,255,255,.4) !important; font-weight: 500; }
      .xpb-v, .xp-val { font-size: .72rem; color: #F5A857 !important; font-weight: 600; }
      .xpb-track, .xp-track, .track {
        height: 5px;
        background: rgba(255,255,255,.1) !important;
        border-radius: 100px;
        overflow: hidden;
      }
      .xpb-fill, .xp-fill, .fill {
        height: 100%;
        background: linear-gradient(90deg, #F4829A, #F5A857) !important;
        border-radius: 100px;
        transition: width .6s ease;
      }
      .main { margin-left: 230px; }
      @media (max-width: 900px) {
        .sidebar { display: none !important; }
        .main { margin-left: 0 !important; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Figure out which lesson we're on ────────────────────── */
  const currentFile = window.location.pathname.split('/').pop();
  const currentIdx  = LESSON_URLS.indexOf(currentFile);

  /* ── Wire sidebar nav items ──────────────────────────────── */
  function wireNav() {
    document.querySelectorAll('.sb-logo').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => { window.location.href = ROOT + 'index.html'; });
    });

    document.querySelectorAll('.sb-item').forEach(el => {
      const text = el.textContent.trim();
      if (text.includes('Lessons')) {
        el.addEventListener('click', () => { window.location.href = ROOT + 'index.html'; });
      }
      if (text.includes('Games')) {
        el.addEventListener('click', () => showComingSoon('Games are coming soon! ✦'));
      }
      if (text.includes('Leaderboard')) {
        el.addEventListener('click', () => showComingSoon('Leaderboard is coming soon! ✦'));
      }
      if (text.includes('Drip Store')) {
        el.addEventListener('click', () => showComingSoon('Drip Store is coming soon! ✦'));
      }
      if (text.includes('Profile')) {
        el.addEventListener('click', () => { window.location.href = ROOT + 'index.html'; });
      }
      if (text.includes('Discord')) {
        el.addEventListener('click', () => { window.open('https://discord.gg/agirlherfutures', '_blank'); });
      }
    });

    // Breadcrumb links
    document.querySelectorAll('.tbar-bc a, .crumb a').forEach(el => {
      el.href = ROOT + 'index.html';
    });
  }

  /* ── Wire completion buttons ─────────────────────────────── */
  function wireCompletionButtons() {
    const nextIdx = currentIdx + 1;
    const nextUrl = nextIdx >= 0 && nextIdx < LESSON_URLS.length
      ? LESSONS + LESSON_URLS[nextIdx]
      : null;
    const nextNum = currentIdx + 2;

    // All possible "next lesson" button patterns
    const nextSelectors = [
      '.complete-btns .btn.primary',
      '.complete-btns .btn-primary',
      '.cc-next',
      '.next-lesson-btn',
    ];
    nextSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(btn => {
        if (nextUrl) {
          btn.onclick = () => { window.location.href = nextUrl; };
          btn.textContent = `Lesson ${nextNum} →`;
        } else {
          btn.onclick = () => { window.location.href = ROOT + 'index.html'; };
          btn.textContent = 'Back to lessons →';
        }
      });
    });

    // All possible "back to lessons" button patterns
    const backSelectors = [
      '.complete-btns .btn.ghost',
      '.cc-hub',
      '.back-to-lessons-btn',
    ];
    backSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(btn => {
        btn.onclick = () => { window.location.href = ROOT + 'index.html'; };
        btn.textContent = '← Back to lessons';
      });
    });
  }

  /* ── Mark Lessons nav item as active ─────────────────────── */
  function setActiveLesson() {
    document.querySelectorAll('.sb-item').forEach(el => {
      el.classList.remove('on', 'active');
      if (el.textContent.trim().includes('Lessons')) {
        el.classList.add('on');
      }
    });
  }

  /* ── Coming soon toast ───────────────────────────────────── */
  function showComingSoon(msg) {
    let toast = document.getElementById('_sb_toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = '_sb_toast';
      toast.style.cssText = `
        position:fixed;bottom:90px;left:50%;
        transform:translateX(-50%) translateY(20px);
        background:#2C1810;color:#fff;padding:12px 22px;
        border-radius:14px;font-family:'DM Sans',sans-serif;
        font-size:.83rem;font-weight:500;
        box-shadow:0 12px 40px rgba(44,24,16,.35);
        z-index:9999;opacity:0;transition:all .35s ease;
        pointer-events:none;white-space:nowrap;
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

  /* ── Boot ────────────────────────────────────────────────── */
  function init() {
    injectStyles();
    wireNav();
    wireCompletionButtons();
    setActiveLesson();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
