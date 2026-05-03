// sidebar.js — A Girl & Her Futures™
// Shared sidebar component — loaded by every lesson page
// To update the sidebar across ALL lessons, edit this one file only.

(function() {
  // ── STYLES ──────────────────────────────────────────────────
  const css = `
    .aghf-sidebar {
      width: 230px;
      position: fixed;
      top: 0; left: 0; bottom: 0;
      background: #2C1810;
      display: flex;
      flex-direction: column;
      z-index: 100;
      overflow-y: auto;
      font-family: 'DM Sans', sans-serif;
    }
    .aghf-sidebar .sb-logo {
      padding: 22px 22px 16px;
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 1rem;
      color: #F4829A;
      border-bottom: 1px solid rgba(255,255,255,.08);
      cursor: pointer;
      display: block;
      text-decoration: none;
    }
    .aghf-sidebar .sb-logo span { color: #7ECEC4; }
    .aghf-sidebar .sb-user {
      padding: 13px 18px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid rgba(255,255,255,.08);
    }
    .aghf-sidebar .sb-av {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #F4829A, #F5A857);
      border: 2px solid rgba(255,255,255,.2);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display', serif;
      font-weight: 700; color: white; font-size: .85rem;
      flex-shrink: 0;
    }
    .aghf-sidebar .sb-nm { font-size: .84rem; font-weight: 600; color: white; }
    .aghf-sidebar .sb-lv { font-size: .68rem; color: rgba(255,255,255,.45); }
    .aghf-sidebar .sb-sec {
      font-size: .62rem; font-weight: 500;
      letter-spacing: .1em; text-transform: uppercase;
      color: rgba(255,255,255,.3);
      padding: 12px 18px 5px;
    }
    .aghf-sidebar .sb-item {
      display: flex; align-items: center; gap: 9px;
      padding: 10px 18px;
      font-size: .85rem;
      color: rgba(255,255,255,.55);
      cursor: pointer;
      transition: all .2s;
      border-left: 3px solid transparent;
      text-decoration: none;
    }
    .aghf-sidebar .sb-item:hover {
      color: white;
      background: rgba(255,255,255,.07);
    }
    .aghf-sidebar .sb-item.active {
      color: #F4829A;
      background: rgba(244,130,154,.12);
      border-left-color: #F4829A;
      font-weight: 500;
    }
    .aghf-sidebar .sb-ico {
      width: 16px; text-align: center;
      font-size: 12px; flex-shrink: 0;
    }
    .aghf-sidebar .sb-bot {
      margin-top: auto;
      padding: 14px 18px;
      border-top: 1px solid rgba(255,255,255,.08);
    }
    .aghf-sidebar .xp-box {
      background: rgba(255,255,255,.06);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .aghf-sidebar .xp-top {
      display: flex; justify-content: space-between;
      margin-bottom: 7px;
    }
    .aghf-sidebar .xp-lbl { font-size: .68rem; color: rgba(255,255,255,.4); font-weight: 500; }
    .aghf-sidebar .xp-val { font-size: .72rem; color: #F5A857; font-weight: 600; }
    .aghf-sidebar .xp-track {
      height: 5px;
      background: rgba(255,255,255,.1);
      border-radius: 100px; overflow: hidden;
    }
    .aghf-sidebar .xp-fill {
      height: 100%;
      background: linear-gradient(90deg, #F4829A, #F5A857);
      border-radius: 100px;
      width: 0%;
      transition: width .6s ease;
    }
    .aghf-sidebar .sb-logout {
      width: 100%; margin-top: 10px;
      padding: 9px; border-radius: 100px;
      border: 1px solid rgba(255,255,255,.15);
      background: transparent;
      color: rgba(255,255,255,.4);
      font-family: 'DM Sans', sans-serif;
      font-size: .78rem; cursor: pointer;
      transition: all .2s;
    }
    .aghf-sidebar .sb-logout:hover {
      background: rgba(244,130,154,.15);
      color: #F4829A;
      border-color: #F4829A;
    }
  `;

  // ── PLATFORM URL — update this if your domain changes ───────
  const PLATFORM_URL = '/agihf/index.html';

  // ── HTML ─────────────────────────────────────────────────────
  function buildSidebar(activePage) {
    return `
      <div class="aghf-sidebar">
        <a class="sb-logo" href="${PLATFORM_URL}">A Girl &amp; <span>Her Futures</span>™</a>
        <div class="sb-user">
          <div class="sb-av" id="aghf-av">D</div>
          <div>
            <div class="sb-nm" id="aghf-name">Trader</div>
            <div class="sb-lv" id="aghf-level">Level 1 · She's Brand New</div>
          </div>
        </div>
        <div class="sb-sec">Learn</div>
        <a class="sb-item ${activePage === 'dashboard' ? 'active' : ''}" href="${PLATFORM_URL}#s-dashboard">
          <span class="sb-ico">⌂</span> Dashboard
        </a>
        <a class="sb-item ${activePage === 'lessons' ? 'active' : ''}" href="${PLATFORM_URL}#s-lessons">
          <span class="sb-ico">✦</span> Lessons
        </a>
        <a class="sb-item ${activePage === 'games' ? 'active' : ''}" href="${PLATFORM_URL}#s-games">
          <span class="sb-ico">◈</span> Games
        </a>
        <div class="sb-sec">Community</div>
        <a class="sb-item ${activePage === 'leaderboard' ? 'active' : ''}" href="${PLATFORM_URL}#s-leaderboard">
          <span class="sb-ico">↑</span> Leaderboard
        </a>
        <a class="sb-item ${activePage === 'discord' ? 'active' : ''}" href="${PLATFORM_URL}#s-store">
          <span class="sb-ico">◈</span> Join Discord
        </a>
        <div class="sb-sec">Account</div>
        <a class="sb-item ${activePage === 'profile' ? 'active' : ''}" href="${PLATFORM_URL}#s-profile">
          <span class="sb-ico">○</span> My Profile
        </a>
        <div class="sb-bot">
          <div class="xp-box">
            <div class="xp-top">
              <span class="xp-lbl">GP</span>
              <span class="xp-val" id="aghf-gp">0 / 1000</span>
            </div>
            <div class="xp-track"><div class="xp-fill" id="aghf-gp-fill"></div></div>
          </div>
          <button class="sb-logout" onclick="aghfLogout()">← Log out</button>
        </div>
      </div>
    `;
  }

  // ── INJECT ───────────────────────────────────────────────────
  function inject() {
    // Hide any existing sidebar elements
    document.querySelectorAll('aside.sidebar, nav.sidebar, .sidebar').forEach(el => {
      el.style.cssText = 'display:none!important';
    });
    // Add font if not already loaded
    if (!document.querySelector('link[href*="fonts.googleapis"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=DM+Sans:wght@400;500;600&display=swap';
      document.head.appendChild(link);
    }

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // Determine active page from URL
    const path = window.location.pathname;
    let activePage = 'lessons';
    if (path.includes('games')) activePage = 'games';

    // Create sidebar container
    const sidebar = document.createElement('div');
    sidebar.innerHTML = buildSidebar(activePage);

    // Insert into .app if it exists, otherwise body
    const appEl = document.querySelector('.app') || document.body;
    appEl.insertBefore(sidebar.firstElementChild, appEl.firstChild);

    // Add margin to existing content so it doesn't hide behind sidebar
    const mainEl = document.querySelector('.main, main, .app > main, #main, .content');
    if (mainEl) {
      mainEl.style.marginLeft = '230px';
    }
    // Also fix body margin if needed
    document.body.style.paddingLeft = '0';

    // Load user data from Supabase if available
    loadUserData();
  }

  // ── LOAD USER DATA ───────────────────────────────────────────
  async function loadUserData() {
    try {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
      const supabase = createClient(
        'https://otxfzalcujhtfwprmptr.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90eGZ6YWxjdWpodGZ3cHJtcHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTYyOTMsImV4cCI6MjA5MzMzMjI5M30.iRxaKgD6ut9urNK67dyvj_6K2lfyw8peBpfJx3oU9A4'
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        // Not logged in — redirect to platform
        window.location.href = PLATFORM_URL;
        return;
      }

      const user = session.user;
      const res = await fetch(`/api/get-profile?userId=${user.id}`);
      const data = await res.json();
      const p = data.profile;
      if (!p) return;

      // Update sidebar with real data
      const nameEl = document.getElementById('aghf-name');
      const levelEl = document.getElementById('aghf-level');
      const avEl = document.getElementById('aghf-av');
      const gpEl = document.getElementById('aghf-gp');
      const gpFill = document.getElementById('aghf-gp-fill');

      const firstName = p.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Trader';
      if (nameEl) nameEl.textContent = firstName;
      if (avEl) avEl.textContent = firstName[0].toUpperCase();

      const levelNames = {
        1:"She's Brand New", 2:'Before the Chart', 3:'Reading Structure',
        4:'Finding Direction', 5:'The ICC Method', 6:'Pulling the Trigger',
        7:'The Mindset', 8:"She's In Structure ✦"
      };
      if (levelEl) levelEl.textContent = `Level ${p.level || 1} · ${levelNames[p.level || 1]}`;

      const gp = p.gp || 0;
      const nextLevel = (p.level || 1) * 1000;
      if (gpEl) gpEl.textContent = `${gp} / ${nextLevel}`;
      if (gpFill) gpFill.style.width = Math.min((gp / nextLevel) * 100, 100) + '%';

      // Store user in window for lesson complete calls
      window.aghfUser = user;
      window.aghfSupabase = supabase;

    } catch (err) {
      console.log('Sidebar: could not load user data', err.message);
    }
  }

  // ── LOGOUT ───────────────────────────────────────────────────
  window.aghfLogout = async function() {
    try {
      if (window.aghfSupabase) await window.aghfSupabase.auth.signOut();
      window.location.href = PLATFORM_URL;
    } catch (err) {
      window.location.href = PLATFORM_URL;
    }
  };

  // ── COMPLETE LESSON HELPER ────────────────────────────────────
  // Call this from any lesson page: aghfCompleteLesson('lesson-01', 50)
  window.aghfCompleteLesson = async function(lessonId, gpEarned) {
    if (!window.aghfUser) return;
    try {
      await fetch('/api/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: window.aghfUser.id,
          lessonId,
          gpEarned: gpEarned || 50
        })
      });
      // Refresh GP display
      await loadUserData();
    } catch (err) {
      console.log('Could not save lesson progress', err.message);
    }
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
