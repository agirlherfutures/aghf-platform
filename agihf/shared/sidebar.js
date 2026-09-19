/**
 * sidebar.js — A Girl & Her Futures™
 *
 * Injects the original dark left sidebar (logo, user/level, Trade/Learn/
 * Community/Account nav, GP box, log out) at the point where this script
 * tag appears, plus a mobile bottom tab bar (+ "More" sheet) below 900px
 * — the desktop sidebar disappears entirely at that width (sidebar.css),
 * so this is the one nav surface both breakpoints share. Include after
 * auth-guard.js so window.AGHF_USER and window.AGHF_FETCH_PROFILE are
 * already available. Replaces nav.js.
 *
 * Usage: <script src="../shared/sidebar.js" data-active="dashboard"></script>
 * data-active must match one of: dashboard, market-outlook, checklist,
 * journal, eval-calculator, agent, lessons, games, chart-lab, playbook,
 * leaderboard, monthly-challenge, store, profile, performance
 */
(function () {
  const script = document.currentScript;
  const active = script.getAttribute('data-active') || '';
  const ROOT = new URL('../', script.src).href;

  const items = [
    { section: 'Trade', key: 'dashboard', icon: '⌂', label: 'Dayli Desk', href: 'dashboard.html', mobileIcon: '⌂', mobileLabel: 'Desk' },
    { section: 'Trade', key: 'market-outlook', icon: '◐', label: 'Market Outlook', href: 'market-outlook.html' },
    { section: 'Trade', key: 'checklist', icon: '▤', label: 'ICC Checklist', href: 'checklist.html', mobileIcon: '▤', mobileLabel: 'Checklist' },
    { section: 'Trade', key: 'journal', icon: '✎', label: 'Journal', href: 'journal.html', mobileIcon: '✎', mobileLabel: 'Journal' },
    { section: 'Trade', key: 'eval-calculator', icon: '✓', label: 'Pass Your Eval', href: 'eval-calculator.html' },
    { section: 'Mindset', key: 'agent', icon: '♡', label: 'AGHF Agent', href: 'psychology.html' },
    { section: 'Learn', key: 'lessons', icon: '✦', label: 'Academy', href: 'lessons.html', mobileIcon: '✦', mobileLabel: 'Academy' },
    { section: 'Learn', key: 'games', icon: '◈', label: 'Games', href: 'games.html' },
    { section: 'Learn', key: 'chart-lab', icon: '◧', label: 'Chart Lab', href: 'chart-lab.html' },
    { section: 'Learn', key: 'playbook', icon: '❦', label: 'Lesson Notes', href: 'playbook.html' },
    { section: 'Community', key: 'leaderboard', icon: '✦', label: 'Share My Win', href: 'share-win.html' },
    { section: 'Community', key: 'monthly-challenge', icon: '🏆', label: 'Monthly Challenge', href: 'monthly-challenge.html' },
    { section: 'Community', key: 'store', icon: '◈', label: 'Join Discord', href: 'store.html' },
    { section: 'Account', key: 'performance', icon: '◔', label: 'Performance', href: 'performance.html' },
    { section: 'Account', key: 'profile', icon: '○', label: 'My Profile', href: 'profile.html' },
  ];

  // The 4 items shown directly in the mobile bottom bar; everything else
  // (including the 4 above, for reachability when the bar isn't handy)
  // lives in the "More" sheet.
  const MOBILE_PRIMARY_KEYS = ['dashboard', 'lessons', 'checklist', 'journal'];

  let sectionsHtml = '';
  let lastSection = null;
  items.forEach((item) => {
    if (item.section !== lastSection) {
      sectionsHtml += `<div class="sb-sec">${item.section}</div>`;
      lastSection = item.section;
    }
    sectionsHtml += `<a class="sb-item${item.key === active ? ' active' : ''}" href="${ROOT}${item.href}"><span class="sb-ico">${item.icon}</span> ${item.label}</a>`;
  });

  const demoBanner = window.AGHF_DEMO
    ? '<div class="demo-banner">👀 Preview Mode — sample data only, nothing here is a real account or saved</div>'
    : '';

  const primaryItems = MOBILE_PRIMARY_KEYS.map((k) => items.find((i) => i.key === k)).filter(Boolean);
  const moreItems = items.filter((i) => !MOBILE_PRIMARY_KEYS.includes(i.key));

  const mobileBarHtml = `
    <nav class="mb-bar" id="mbBar">
      ${primaryItems.map((item) => `<a class="mb-item${item.key === active ? ' active' : ''}" href="${ROOT}${item.href}"><span class="mb-ico">${item.mobileIcon || item.icon}</span><span class="mb-lbl">${item.mobileLabel || item.label}</span></a>`).join('')}
      <button type="button" class="mb-item mb-more" id="mbMoreBtn" aria-haspopup="true" aria-expanded="false"><span class="mb-ico">⋯</span><span class="mb-lbl">More</span></button>
    </nav>
    <div class="mb-sheet" id="mbSheet">
      <div class="mb-sheet-card">
        <div class="mb-sheet-handle"></div>
        ${moreItems.map((item) => `<a class="mb-sheet-item${item.key === active ? ' active' : ''}" href="${ROOT}${item.href}"><span class="mb-ico">${item.icon}</span> ${item.label}</a>`).join('')}
        <button class="mb-sheet-item mb-sheet-logout" id="mbLogout"><span class="mb-ico">←</span> Log out</button>
      </div>
    </div>
  `;

  const html = `
    ${demoBanner}
    <aside class="sb">
      <div class="sb-top">
        <div class="sb-user">
          <div class="sb-av" id="sbAvatar">D</div>
          <div>
            <div class="sb-nm" id="sbName">Trader</div>
            <div class="sb-lv" id="sbLevel">Level 1 · She's Brand New</div>
          </div>
          <div class="sb-notif-wrap" id="sbNotifWrap"></div>
        </div>
      </div>
      ${sectionsHtml}
      <div class="sb-bot">
        <div class="xp-box">
          <div class="xp-top"><span class="xp-lbl">GP</span><span class="xp-val" id="sbXpVal">0 / 1000</span></div>
          <div class="xp-track"><div class="xp-fill" id="sbXpFill" style="width:0%"></div></div>
        </div>
        <button class="sb-logout" id="sbLogout">← Log out</button>
      </div>
    </aside>
    ${mobileBarHtml}
  `;

  script.insertAdjacentHTML('beforebegin', html);

  // ── Smooth page-to-page transitions ───────────────────────────────
  // This site has no SPA router — every nav is a real browser
  // navigation — so without this, leaving a page is an instant, jarring
  // cut to blank rather than a fade. This used to defer to the browser's
  // own native cross-document view-transition crossfade (tokens.css's
  // `@view-transition { navigation: auto; }`) wherever `startViewTransition`
  // existed, on the theory that Chromium browsers would smooth the
  // navigation out on their own — in practice that wasn't visibly
  // happening, so this now always runs its own fade unconditionally,
  // on every browser, instead of trusting a platform feature it can't
  // fully control.
  const FADE_MS = 160;
  function fadeNavigate(href) {
    document.body.style.transition = `opacity ${FADE_MS}ms ease`;
    document.body.style.opacity = '0';
    setTimeout(() => { window.location.href = href; }, FADE_MS);
  }
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    let url;
    try { url = new URL(a.href, location.href); } catch { return; }
    if (url.origin !== location.origin) return;
    // Same-page hash link — nothing to fade to, let the browser handle it.
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
    e.preventDefault();
    fadeNavigate(a.href);
  });
  // A back/forward navigation can restore this exact page from the
  // browser's cache mid-fade (opacity still 0) — reset it so the page
  // isn't stuck invisible.
  window.addEventListener('pageshow', () => {
    document.body.style.transition = '';
    document.body.style.opacity = '';
  });

  async function doLogout() {
    if (window.AGHF_DEMO) {
      sessionStorage.removeItem('aghf_demo');
    } else if (window.AGHF_SUPABASE) {
      await window.AGHF_SUPABASE.auth.signOut();
    }
    fadeNavigate(`${ROOT}login.html`);
  }
  document.getElementById('sbLogout').addEventListener('click', doLogout);
  document.getElementById('mbLogout').addEventListener('click', doLogout);

  const moreBtn = document.getElementById('mbMoreBtn');
  const sheet = document.getElementById('mbSheet');
  function closeSheet() {
    sheet.classList.remove('open');
    moreBtn.setAttribute('aria-expanded', 'false');
  }
  function toggleSheet() {
    const willOpen = !sheet.classList.contains('open');
    sheet.classList.toggle('open', willOpen);
    moreBtn.setAttribute('aria-expanded', String(willOpen));
  }
  moreBtn.addEventListener('click', toggleSheet);
  sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

  async function updateSidebar() {
    const user = window.AGHF_USER;
    if (user && user.email) {
      document.getElementById('sbAvatar').textContent = user.email.trim().charAt(0).toUpperCase();
    }
    if (!window.AGHF_FETCH_PROFILE) return;
    try {
      const data = await window.AGHF_FETCH_PROFILE();
      const p = data.profile || {};
      const name = p.full_name || (user && user.email && user.email.split('@')[0]) || 'Trader';
      const level = p.level || 1;
      const levelName = p.level_name || "She's Brand New";
      const gp = p.gp || 0;
      const nextLevelGp = level * 1000;
      document.getElementById('sbName').textContent = name;
      document.getElementById('sbLevel').textContent = `Level ${level} · ${levelName}`;
      document.getElementById('sbXpVal').textContent = `${gp} / ${nextLevelGp}`;
      document.getElementById('sbXpFill').style.width = Math.min((gp / nextLevelGp) * 100, 100) + '%';
      document.getElementById('sbAvatar').textContent = name.trim().charAt(0).toUpperCase();
    } catch (err) {
      console.error('Sidebar profile load error:', err);
    }
  }

  // Notification bell — dynamically imported so a missing/unmigrated
  // Monthly Challenge table can never break the sidebar itself (this
  // script runs on every page). Silently renders nothing on failure.
  async function loadNotifBell() {
    const wrap = document.getElementById('sbNotifWrap');
    if (!wrap) return;
    try {
      const [{ getNotifications, markNotificationRead, markAllNotificationsRead }, { renderNotificationBell }] = await Promise.all([
        import(`${ROOT}shared/challenge-service.js`),
        import(`${ROOT}shared/challenge-engine.js`),
      ]);
      const paintBell = async () => {
        const data = await getNotifications();
        renderNotificationBell(wrap, data, {
          onOpen: () => {},
          onMarkAllRead: async () => { await markAllNotificationsRead(); paintBell(); },
          onOpenNotification: async (id) => { await markNotificationRead(id); paintBell(); },
        });
      };
      await paintBell();
    } catch (err) {
      console.error('Notification bell load error:', err);
    }
  }

  document.addEventListener('aghf-auth-ready', () => {
    updateSidebar();
    loadNotifBell();
  });
})();
