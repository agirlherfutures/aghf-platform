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


  // Line icons (24px grid, drawn with currentColor) so the menu matches the
  // illustrated look instead of mixed text glyphs.
  const ICON_PATHS = {
    desk: '<path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/>',
    outlook: '<path d="M4 19h16"/><path d="M5 15l4-5 3 3 4-6 3 4"/>',
    checklist: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8.5 9l1.5 1.5L13 7.5"/><path d="M8.5 15l1.5 1.5 3-3"/><path d="M15 9.5h1M15 15.5h1"/>',
    journal: '<path d="M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2z"/><path d="M6 18a2 2 0 0 1 2-2h10"/><path d="M10 8h5"/>',
    eval: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    agent: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    academy: '<path d="M3 9l9-4 9 4-9 4z"/><path d="M7 11v4c0 1.5 2.2 3 5 3s5-1.5 5-3v-4"/><path d="M21 9v5"/>',
    mydesk: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M9 21h6M12 17v4"/><path d="M7 13l3-3 2 2 4-4"/>',
    games: '<rect x="3" y="8" width="18" height="10" rx="5"/><path d="M8 11v4M6 13h4"/><circle cx="15.5" cy="12" r=".8"/><circle cx="17.5" cy="14.5" r=".8"/>',
    notes: '<path d="M7 3h10a1 1 0 0 1 1 1v17l-6-4-6 4V4a1 1 0 0 1 1-1z"/>',
    win: '<path d="M12 3l2.5 5.2 5.5.8-4 3.9 1 5.6-5-2.7-5 2.7 1-5.6-4-3.9 5.5-.8z"/>',
    challenge: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M16 6h3a2 2 0 0 1-2 4h-1M8 6H5a2 2 0 0 0 2 4h1"/><path d="M12 13v4M8.5 20h7"/>',
    discord: '<path d="M5 6.5C7 5 9 4.6 10 4.6l.5 1h3l.5-1c1 0 3 .4 5 1.9 1.4 2.6 2 5.5 1.8 9-1.7 1.4-3.4 2.2-5 2.5l-1-1.7M5 6.5C3.6 9 3 12 3.2 15.5c1.7 1.4 3.4 2.2 5 2.5l1-1.7"/><path d="M8 15.5c2.6 1.2 5.4 1.2 8 0"/><circle cx="9.3" cy="11.5" r="1"/><circle cx="14.7" cy="11.5" r="1"/>',
    performance: '<path d="M4 20h16"/><rect x="6" y="11" width="3" height="6" rx="1"/><rect x="11" y="7" width="3" height="10" rx="1"/><rect x="16" y="13" width="3" height="4" rx="1"/>',
    profile: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5"/>',
    more: '<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>',
    logout: '<path d="M14 5h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4"/><path d="M10 8l-4 4 4 4M6 12h9"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  };
  const icon = (name) => `<svg class="sb-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ''}</svg>`;
  window.AGHF_ICON = icon;

  const items = [
    { section: 'Trade', key: 'dashboard', icon: 'desk', label: 'Dayli Desk', href: 'dashboard.html', mobileLabel: 'Desk' },
    { section: 'Trade', key: 'market-outlook', icon: 'outlook', label: 'Market Outlook', href: 'market-outlook.html' },
    { section: 'Trade', key: 'checklist', icon: 'checklist', label: 'ICC Checklist', href: 'checklist.html', mobileLabel: 'Checklist' },
    { section: 'Trade', key: 'journal', icon: 'journal', label: 'Journal', href: 'journal.html', mobileLabel: 'Journal' },
    { section: 'Trade', key: 'eval-calculator', icon: 'eval', label: 'Pass Your Eval', href: 'eval-calculator.html' },
    { section: 'Mindset', key: 'agent', icon: 'agent', label: 'AGHF Agent', href: 'psychology.html' },
    { section: 'Learn', key: 'lessons', icon: 'academy', label: 'Academy', href: 'lessons.html', mobileLabel: 'Academy' },
    { section: 'Learn', key: 'desk', icon: 'mydesk', label: 'My Trader Desk', href: 'desk.html' },
    { section: 'Learn', key: 'games', icon: 'games', label: 'Games', href: 'games.html' },
    // Chart Lab nav entry temporarily removed — the feature isn't working
    // correctly and is hidden from members until it's fixed.
    { section: 'Learn', key: 'playbook', icon: 'notes', label: 'Lesson Notes', href: 'playbook.html' },
    { section: 'Community', key: 'leaderboard', icon: 'win', label: 'Share My Win', href: 'share-win.html' },
    { section: 'Community', key: 'monthly-challenge', icon: 'challenge', label: 'Monthly Challenge', href: 'monthly-challenge.html' },
    { section: 'Community', key: 'store', icon: 'discord', label: 'Join Discord', href: 'store.html' },
    { section: 'Account', key: 'performance', icon: 'performance', label: 'Performance', href: 'performance.html' },
    { section: 'Account', key: 'profile', icon: 'profile', label: 'My Profile', href: 'profile.html' },
  ];

  // The 4 items shown directly in the mobile bottom bar; everything else
  // (including the 4 above, for reachability when the bar isn't handy)
  // lives in the "More" sheet.
  const MOBILE_PRIMARY_KEYS = ['dashboard', 'lessons', 'checklist', 'journal'];

  let sectionsHtml = '';
  let lastSection = null;
  items.forEach((item) => {
    if (item.section !== lastSection) {
      sectionsHtml += `<div class="sb-sec">✦ ${item.section}</div>`;
      lastSection = item.section;
    }
    sectionsHtml += `<a class="sb-item sb-${item.section.toLowerCase()}${item.key === active ? ' active' : ''}" href="${ROOT}${item.href}"${item.key === active ? ' aria-current="page"' : ''}><span class="sb-ico">${icon(item.icon)}</span><span>${item.label}</span></a>`;
  });

  const demoBanner = window.AGHF_DEMO
    ? '<div class="demo-banner">👀 Preview Mode — sample data only, nothing here is a real account or saved</div>'
    : '';

  const primaryItems = MOBILE_PRIMARY_KEYS.map((k) => items.find((i) => i.key === k)).filter(Boolean);
  const moreItems = items.filter((i) => !MOBILE_PRIMARY_KEYS.includes(i.key));

  const mobileBarHtml = `
    <nav class="mb-bar" id="mbBar">
      ${primaryItems.map((item) => `<a class="mb-item${item.key === active ? ' active' : ''}" href="${ROOT}${item.href}"><span class="mb-ico">${icon(item.icon)}</span><span class="mb-lbl">${item.mobileLabel || item.label}</span></a>`).join('')}
      <button type="button" class="mb-item mb-more" id="mbMoreBtn" aria-haspopup="true" aria-expanded="false"><span class="mb-ico">${icon('more')}</span><span class="mb-lbl">More</span></button>
    </nav>
    <div class="mb-sheet" id="mbSheet">
      <div class="mb-sheet-card">
        <div class="mb-sheet-handle"></div>
        ${moreItems.map((item) => `<a class="mb-sheet-item sb-${item.section.toLowerCase()}${item.key === active ? ' active' : ''}" href="${ROOT}${item.href}"><span class="mb-ico">${icon(item.icon)}</span> ${item.label}</a>`).join('')}
        <button class="mb-sheet-item mb-sheet-logout" id="mbLogout"><span class="mb-ico">${icon('logout')}</span> Log out</button>
      </div>
    </div>
  `;

  const html = `
    ${demoBanner}
    <aside class="sb">
      <div class="sb-top">
        <a class="sb-logo" href="${ROOT}dashboard.html" aria-label="A Girl &amp; Her Futures Academy home"><img src="${ROOT}logo.png" alt="A Girl &amp; Her Futures"></a>
        <div class="sb-user">
          <div class="sb-av" id="sbAvatar">D</div>
          <div>
            <div class="sb-nm" id="sbName">Trader</div>
            <div class="sb-lv" id="sbLevel">You're Brand New</div>
          </div>
          <div class="sb-notif-wrap" id="sbNotifWrap"></div>
        </div>
      </div>
      ${sectionsHtml}
      <div class="sb-bot">
        <div class="xp-box">
          <div class="xp-top"><span class="xp-lbl" id="sbXpLbl">Level 1 · GP</span><span class="xp-val" id="sbXpVal">0 / 1000</span></div>
          <div class="xp-track"><div class="xp-fill" id="sbXpFill" style="width:0%"></div></div>
        </div>
        <button class="sb-logout" id="sbLogout">${icon('logout')} Log out</button>
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
      // Older profiles stored "She's …" level names; show them as "You're …".
      const levelName = String(p.level_name || "You're Brand New").replace(/^(she)(['’])s\b/i, (m, she, apos) => (she === 'SHE' ? `YOU${apos}RE` : `You${apos}re`));
      const gp = p.gp || 0;
      const nextLevelGp = level * 1000;
      document.getElementById('sbName').textContent = name;
      document.getElementById('sbLevel').textContent = levelName;
      document.getElementById('sbXpLbl').textContent = `Level ${level} · GP`;
      document.getElementById('sbXpVal').textContent = `${gp.toLocaleString('en-US')} / ${nextLevelGp.toLocaleString('en-US')}`;
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
