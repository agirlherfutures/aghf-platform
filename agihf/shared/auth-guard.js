/**
 * auth-guard.js — A Girl & Her Futures™
 *
 * Include as the FIRST script tag in <body>, before any lesson/game
 * content, on every protected page. Verifies there is a live Supabase
 * session; if not, redirects to the SPA login screen (index.html has no
 * separate login.html — login lives inside the SPA as the #s-login screen)
 * with a `redirect` param so the learner lands back on this exact page
 * after logging in.
 *
 * On success, exposes:
 *   window.AGHF_USER          -> { id, email }
 *   window.AGHF_SESSION_TOKEN -> current access token, for Authorization headers
 * and fires an `aghf-auth-ready` event on `document`.
 */
(function () {
  const SUPABASE_URL = 'https://otxfzalcujhtfwprmptr.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90eGZ6YWxjdWpodGZ3cHJtcHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTYyOTMsImV4cCI6MjA5MzMzMjI5M30.iRxaKgD6ut9urNK67dyvj_6K2lfyw8peBpfJx3oU9A4';

  // The repo root (where index.html lives) is always one directory up from
  // wherever this script itself is served from — this works the same
  // whether the including page is a lesson 4 levels deep or a game 1 level
  // deep, unlike a hardcoded relative path.
  const scriptSrc = document.currentScript.src;
  const ROOT = new URL('../', scriptSrc).href;

  // Hide the page until we know whether the visitor is authenticated, so
  // protected content never flashes before a redirect.
  document.documentElement.style.visibility = 'hidden';

  function bounceToLogin() {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `${ROOT}index.html?redirect=${redirect}&screen=login`;
  }

  async function run() {
    try {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
      const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON);
      const { data: { session }, error } = await supabaseClient.auth.getSession();

      if (error || !session) {
        bounceToLogin();
        return;
      }

      window.AGHF_USER = { id: session.user.id, email: session.user.email };
      window.AGHF_SESSION_TOKEN = session.access_token;
      window.AGHF_SUPABASE = supabaseClient;

      // If the session drops mid-lesson (sign out in another tab, token
      // expiry with no refresh), bounce back to login rather than leaving
      // stale content on screen.
      supabaseClient.auth.onAuthStateChange((event, newSession) => {
        if (event === 'SIGNED_OUT' || !newSession) {
          bounceToLogin();
          return;
        }
        window.AGHF_SESSION_TOKEN = newSession.access_token;
      });

      document.documentElement.style.visibility = '';
      document.dispatchEvent(new Event('aghf-auth-ready'));
    } catch (err) {
      console.error('Auth guard error:', err);
      bounceToLogin();
    }
  }

  run();
})();
