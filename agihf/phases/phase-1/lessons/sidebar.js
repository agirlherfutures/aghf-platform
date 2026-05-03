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

  /* ── Rebuild sidebar HTML to exactly match the dashboard ─── */
  function wireNav() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // Preserve the existing user info if present
    const existingUser = sidebar.querySelector('.sb-user');
    const userName = existingUser?.querySelector('.sb-nm')?.textContent || 'Trader';
    const userLevel = existingUser?.querySelector('.sb-lv')?.textContent || 'Level 1 · She\'s Brand New';
    const userInitial = userName.charAt(0).toUpperCase();

    sidebar.innerHTML = `
      <div class="sb-logo" style="cursor:pointer">A Girl &amp; <span>Her Futures</span>™</div>
      <div class="sb-user">
        <div class="sb-av">${userInitial}</div>
        <div>
          <div class="sb-nm">${userName}</div>
          <div class="sb-lv">${userLevel}</div>
        </div>
      </div>
      <div class="sb-sec">Learn</div>
      <div class="sb-item" id="sbnav-dashboard"><span class="sb-ico">⌂</span> Dashboard</div>
      <div class="sb-item on" id="sbnav-lessons"><span class="sb-ico">✦</span> Lessons</div>
      <div class="sb-item" id="sbnav-games"><span class="sb-ico">◈</span> Games</div>
      <div class="sb-sec">Community</div>
      <div class="sb-item" id="sbnav-leaderboard"><span class="sb-ico">↑</span> Leaderboard</div>
      <div class="sb-item" id="sbnav-discord"><span class="sb-ico">◈</span> Join Discord</div>
      <div class="sb-sec">Account</div>
      <div class="sb-item" id="sbnav-profile"><span class="sb-ico">○</span> My Profile</div>
      <div class="sb-bot">
        <div class="xp-box">
          <div class="xp-top">
            <span class="xp-lbl">GP</span>
            <span class="xp-val">0 / 1000</span>
          </div>
          <div class="xp-track"><div class="xp-fill"></div></div>
        </div>
        <button id="sbnav-logout"
          style="width:100%;margin-top:10px;padding:9px;border-radius:100px;border:1px solid rgba(255,255,255,.15);background:transparent;color:rgba(255,255,255,.4);font-family:'DM Sans',sans-serif;font-size:.78rem;cursor:pointer;transition:all .2s;"
          onmouseover="this.style.background='rgba(244,130,154,.15)';this.style.color='var(--pink)';this.style.borderColor='var(--pink)'"
          onmouseout="this.style.background='transparent';this.style.color='rgba(255,255,255,.4)';this.style.borderColor='rgba(255,255,255,.15)'">
          ← Log out
        </button>
      </div>
    `;

    // Wire up clicks
    document.getElementById('sbnav-dashboard').onclick  = () => { window.location.href = ROOT + 'index.html'; };
    document.getElementById('sbnav-lessons').onclick    = () => { window.location.href = ROOT + 'index.html'; };
    document.getElementById('sbnav-games').onclick      = () => { window.location.href = ROOT + 'index.html'; };
    document.getElementById('sbnav-leaderboard').onclick= () => { window.location.href = ROOT + 'index.html'; };
    document.getElementById('sbnav-discord').onclick    = () => { window.location.href = ROOT + 'index.html'; };
    document.getElementById('sbnav-profile').onclick    = () => { window.location.href = ROOT + 'index.html'; };
    document.getElementById('sbnav-logout').onclick     = () => { window.location.href = ROOT + 'index.html'; };

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

  /* ── Boot ────────────────────────────────────────────────── */
  function init() {
    injectStyles();
    wireNav();
    wireCompletionButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
