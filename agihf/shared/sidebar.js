/**
 * sidebar.js — A Girl & Her Futures™
 *
 * Injects the original dark left sidebar (logo, user/level, Learn/
 * Community/Account nav, GP box, log out) at the point where this script
 * tag appears. Include after auth-guard.js so window.AGHF_USER and
 * window.AGHF_FETCH_PROFILE are already available. Replaces nav.js.
 *
 * Usage: <script src="../shared/sidebar.js" data-active="dashboard"></script>
 * data-active must match one of: dashboard, lessons, games, leaderboard,
 * store, profile
 */
(function () {
  const script = document.currentScript;
  const active = script.getAttribute('data-active') || '';
  const ROOT = new URL('../', script.src).href;

  const items = [
    { section: 'Learn', key: 'dashboard', icon: '⌂', label: 'Dashboard', href: 'dashboard.html' },
    { section: 'Learn', key: 'lessons', icon: '✦', label: 'Lessons', href: 'lessons.html' },
    { section: 'Learn', key: 'games', icon: '◈', label: 'Games', href: 'games.html' },
    { section: 'Community', key: 'leaderboard', icon: '↑', label: 'Leaderboard', href: 'leaderboard.html' },
    { section: 'Community', key: 'store', icon: '◈', label: 'Join Discord', href: 'store.html' },
    { section: 'Account', key: 'profile', icon: '○', label: 'My Profile', href: 'profile.html' },
  ];

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

  const html = `
    ${demoBanner}
    <aside class="sb">
      <a class="sb-logo" href="${ROOT}index.html">A Girl &amp; <span>Her Futures</span>™</a>
      <div class="sb-user">
        <div class="sb-av" id="sbAvatar">D</div>
        <div>
          <div class="sb-nm" id="sbName">Trader</div>
          <div class="sb-lv" id="sbLevel">Level 1 · She's Brand New</div>
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
  `;

  script.insertAdjacentHTML('beforebegin', html);

  document.getElementById('sbLogout').addEventListener('click', async () => {
    if (window.AGHF_DEMO) {
      sessionStorage.removeItem('aghf_demo');
    } else if (window.AGHF_SUPABASE) {
      await window.AGHF_SUPABASE.auth.signOut();
    }
    window.location.href = `${ROOT}login.html`;
  });

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

  document.addEventListener('aghf-auth-ready', updateSidebar);
})();
