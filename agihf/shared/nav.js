/**
 * nav.js — A Girl & Her Futures™
 *
 * Injects the shared .site-header (logo, nav links, avatar) at the point
 * where this script tag appears. Include after auth-guard.js so
 * window.AGHF_USER is already set.
 *
 * Usage: <script src="../shared/nav.js" data-active="games"></script>
 * data-active must match one of: dashboard, lessons, games, yearbook
 */
(function () {
  const script = document.currentScript;
  const active = script.getAttribute('data-active') || '';
  const ROOT = new URL('../', script.src).href;

  const links = [
    { key: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
    { key: 'lessons', label: 'Lessons', href: 'lessons.html' },
    { key: 'games', label: 'Games', href: 'games.html' },
    { key: 'yearbook', label: 'Yearbook', href: 'yearbook.html' },
  ];

  const navHtml = links
    .map((l) => `<a href="${ROOT}${l.href}"${l.key === active ? ' class="current"' : ''}>${l.label}</a>`)
    .join('');

  function avatarInitial() {
    const user = window.AGHF_USER;
    if (!user || !user.email) return '';
    return user.email.trim().charAt(0).toUpperCase();
  }

  const demoBanner = window.AGHF_DEMO
    ? '<div class="demo-banner">👀 Preview Mode — sample data only, nothing here is a real account or saved</div>'
    : '';

  const html = `
    ${demoBanner}
    <header class="site-header">
      <a class="site-logo" href="${ROOT}dashboard.html">
        <div class="site-logo-mark">GF</div>
        <div>
          <div class="site-logo-text">A Girl &amp; Her Futures</div>
          <div class="site-logo-sub">DAYLI'S TRADING SCHOOL</div>
        </div>
      </a>
      <nav class="site-nav">${navHtml}</nav>
      <a class="site-avatar" href="${ROOT}profile.html" title="Profile">${avatarInitial()}</a>
    </header>
  `;

  script.insertAdjacentHTML('beforebegin', html);

  document.addEventListener('aghf-auth-ready', () => {
    const av = document.querySelector('.site-avatar');
    if (av) av.textContent = avatarInitial();
  });
})();
