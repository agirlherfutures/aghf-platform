/**
 * auth-guard.js — A Girl & Her Futures™
 *
 * Include as the FIRST script tag in <body>, before any lesson/game
 * content, on every protected page. Verifies there is a live Supabase
 * session; if not, redirects to the standalone login.html with a
 * `redirect` param so the learner lands back on this exact page after
 * logging in.
 *
 * On success, exposes:
 *   window.AGHF_USER          -> { id, email }
 *   window.AGHF_SESSION_TOKEN -> current access token, for Authorization headers
 *   window.AGHF_FETCH_PROFILE -> async () => same shape as /api/get-profile's response
 * and fires an `aghf-auth-ready` event on `document`.
 *
 * DEMO MODE: if sessionStorage.aghf_demo is set (login.html's "Preview the
 * site" link sets it), every page is unlocked with mock data and no real
 * Supabase/API calls are made — see window.AGHF_DEMO and AGHF_FETCH_PROFILE.
 * This exists purely so the built pages can be reviewed even when Supabase
 * itself is unreachable (e.g. a paused free-tier project). Nothing in demo
 * mode is persisted anywhere.
 */
(function () {
  const SUPABASE_URL = 'https://otxfzalcujhtfwprmptr.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90eGZ6YWxjdWpodGZ3cHJtcHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTYyOTMsImV4cCI6MjA5MzMzMjI5M30.iRxaKgD6ut9urNK67dyvj_6K2lfyw8peBpfJx3oU9A4';

  const DEMO_PROFILE = {
    profile: { full_name: 'Demo Trader', email: 'demo@preview.local', level: 1, level_name: "She's Brand New", gp: 0, day_streak: 0 },
    lessons_completed: [],
    lessons_count: 0,
    subscription: { status: 'demo' },
  };

  // The repo root (where index.html lives) is always one directory up from
  // wherever this script itself is served from — this works the same
  // whether the including page is a lesson 4 levels deep or a game 1 level
  // deep, unlike a hardcoded relative path.
  const scriptSrc = document.currentScript.src;
  const ROOT = new URL('../', scriptSrc).href;

  // Hide the page until we know whether the visitor is authenticated, so
  // protected content never flashes before a redirect. Paired with a
  // opacity fade (rather than an instant visibility snap) purely for
  // smoothness on the way back in — visibility itself still does the real
  // work of keeping protected content unreadable/non-interactive while
  // hidden; opacity is what makes the reveal not look like a jarring pop.
  document.documentElement.style.visibility = 'hidden';
  document.documentElement.style.opacity = '0';

  // TEMPORARY DIAGNOSTIC — a member's real account is going blank in a way
  // that's been hard to pin down over chat (blank forever vs. a redirect,
  // and why, all look the same from the outside). This narrates every real
  // step of the auth check directly on the page in plain text, so the
  // actual failure point is readable at a glance instead of guessed at.
  // Skipped entirely in demo mode — there's nothing to diagnose there, and
  // it would just be visual noise on an already-working path. Remove this
  // whole block (and its call sites below) once the real root cause is
  // confirmed and fixed.
  const isDemo = sessionStorage.getItem('aghf_demo') === '1';
  let diagBox = null;
  if (!isDemo) {
    diagBox = document.createElement('div');
    diagBox.style.cssText = 'position:fixed;bottom:8px;right:8px;background:#000;color:#0f0;font:11px/1.4 monospace;padding:8px 10px;z-index:2147483647;max-width:92vw;max-height:60vh;overflow:auto;white-space:pre-wrap;border-radius:6px;visibility:visible;';
    diagBox.textContent = 'Auth check starting…';
    document.body.appendChild(diagBox);
  }
  function logStep(msg) {
    if (!diagBox) return;
    const line = `[${new Date().toISOString().slice(11, 19)}] ${msg}`;
    diagBox.textContent += '\n' + line;
    console.log('AuthGuard:', line);
  }

  function bounceToLogin(reason) {
    logStep('Bouncing to login. Reason: ' + (reason || 'unknown'));
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    const reasonParam = reason ? `&reason=${encodeURIComponent(reason)}` : '';
    window.location.href = `${ROOT}login.html?redirect=${redirect}${reasonParam}`;
  }

  // Loads the Supabase client from a same-origin vendored file rather than
  // a third-party CDN. This used to be a dynamic `import()` of
  // https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm — reasonable
  // in isolation, but real-world testing found it silently never
  // resolving in some browsers' stricter privacy modes (Safari, Brave
  // Shields), with no console error and no visible failed network
  // request — the page just stayed hidden forever (see the `visibility:
  // hidden` line above). A same-origin script tag removes that entire
  // class of third-party-script-blocking failure, matching how every
  // other script on this site is already served from the app's own
  // origin. The UMD build attaches `window.supabase.createClient`.
  function loadSupabaseLib() {
    return new Promise((resolve, reject) => {
      if (window.supabase?.createClient) { resolve(window.supabase); return; }
      const script = document.createElement('script');
      script.src = new URL('vendor/supabase-js.umd.js', scriptSrc).href;
      script.onload = () => resolve(window.supabase);
      script.onerror = () => reject(new Error('Could not load the Supabase client library'));
      document.head.appendChild(script);
    });
  }

  // This script is a classic (non-module) tag, so it runs synchronously
  // while the document is still parsing. Consuming pages listen for
  // `aghf-auth-ready` from a type="module" script, and module scripts are
  // deferred by spec — they don't run until *after* parsing finishes. If
  // we dispatched the event immediately here (as the demo-mode branch used
  // to), it would fire before any page's module script had registered its
  // listener, so `load()` would simply never run. Waiting for
  // DOMContentLoaded guarantees every deferred/module script (including
  // the listener registration) has already executed by the time we fire.
  function fireAuthReady() {
    document.documentElement.style.visibility = '';
    document.documentElement.style.transition = 'opacity .15s ease';
    document.documentElement.style.opacity = '1';
    document.dispatchEvent(new Event('aghf-auth-ready'));
  }
  function fireAuthReadySafely() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fireAuthReady);
    } else {
      fireAuthReady();
    }
  }

  if (isDemo) {
    window.AGHF_DEMO = true;
    window.AGHF_USER = { id: 'demo', email: 'demo@preview.local' };
    window.AGHF_SESSION_TOKEN = null;
    window.AGHF_FETCH_PROFILE = async () => DEMO_PROFILE;
    fireAuthReadySafely();
    return;
  }

  window.AGHF_FETCH_PROFILE = async function () {
    const res = await fetch('/api/get-profile', { headers: { Authorization: `Bearer ${window.AGHF_SESSION_TOKEN}` } });
    return res.json();
  };

  function withTimeout(promise, ms, message) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
    ]);
  }

  async function run() {
    try {
      logStep('Loading Supabase library…');
      const { createClient, processLock } = await loadSupabaseLib();
      logStep('Library loaded');
      // The default auth lock uses navigator.locks to serialize auth calls
      // across tabs of the same origin. Every page on this site is a fresh
      // full navigation (no SPA routing), each creating its own client — if
      // a prior page navigated away mid-refresh without cleanly releasing
      // its Web Lock (browsers don't always guarantee this on unload), the
      // next page's getSession() call hangs forever waiting on a lock
      // nothing will ever release: no error, no network request, just a
      // permanently blank page (this script hides the whole document until
      // run() succeeds or fails). processLock is Supabase's own in-memory,
      // single-tab lock — this app never needs cross-tab coordination, so
      // it removes the hang entirely instead of working around it.
      const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { lock: processLock } });
      logStep('Calling getSession()…');
      const { data: { session }, error } = await withTimeout(
        supabaseClient.auth.getSession(),
        10000,
        'Timed out checking your session'
      );
      logStep(`getSession() returned: session=${session ? 'yes (user ' + session.user.email + ')' : 'no'} error=${error ? error.message : 'none'}`);

      if (error || !session) {
        bounceToLogin('no session or getSession error: ' + (error ? error.message : 'no session'));
        return;
      }

      window.AGHF_USER = { id: session.user.id, email: session.user.email };
      window.AGHF_SESSION_TOKEN = session.access_token;
      window.AGHF_SUPABASE = supabaseClient;

      // If the session drops mid-lesson (sign out in another tab), bounce
      // back to login rather than leaving stale content on screen. Only
      // an explicit SIGNED_OUT event counts as that — a merely-falsy
      // newSession on some other event (e.g. the INITIAL_SESSION event
      // Supabase fires right after subscribing here, which can carry no
      // session for a moment even on a genuinely valid login, especially
      // right after the project itself was paused/restored) must never
      // bounce a member who just successfully passed the getSession()
      // check above — that was the exact cause of pages flashing content
      // then redirecting straight back to login.
      supabaseClient.auth.onAuthStateChange((event, newSession) => {
        if (event === 'SIGNED_OUT') {
          bounceToLogin('onAuthStateChange fired SIGNED_OUT');
          return;
        }
        if (newSession) window.AGHF_SESSION_TOKEN = newSession.access_token;
      });

      logStep('Auth OK — showing page');
      if (diagBox) setTimeout(() => diagBox.remove(), 4000);
      fireAuthReadySafely();
    } catch (err) {
      console.error('Auth guard error:', err);
      bounceToLogin('threw: ' + err.message);
    }
  }

  run();
})();
