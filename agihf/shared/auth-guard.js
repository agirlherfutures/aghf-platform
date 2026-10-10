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
    profile: { full_name: 'Demo Trader', email: 'demo@preview.local', level: 1, level_name: "You're Brand New", gp: 0, day_streak: 0 },
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
  //
  // Hides <body>, deliberately NOT <html> — opacity/visibility on an
  // element makes its entire rendered subtree transparent, including any
  // background-color the subtree would otherwise paint. <html> has no
  // background of its own (only <body> does, via tokens.css), so hiding
  // <html> let the browser's own default canvas show through underneath
  // — plain white — for the whole duration of the auth check, on every
  // single navigation. Hiding <body> instead leaves <html>'s own
  // background (tokens.css: `html { background: var(--warm) }`) visible
  // and opaque the whole time, so the hidden window reads as the site's
  // own cream color instead of a jarring white flash.
  document.body.style.visibility = 'hidden';

  // A branded loading overlay, shown for however long the auth check (and
  // on a slow connection, the page's own data-fetching JS) takes — instead
  // of the hidden <body> just reading as a blank cream screen with nothing
  // happening. Explicit visibility:visible overrides the hidden <body> it
  // lives inside, same technique the diagnostic box below already uses.
  const loader = document.createElement('div');
  loader.id = 'aghfLoader';
  loader.style.cssText = 'visibility:visible;position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:radial-gradient(55% 40% at 8% 0%, var(--pink-pale) 0%, transparent 70%),radial-gradient(45% 35% at 100% 8%, var(--teal-pale) 0%, transparent 70%),radial-gradient(50% 40% at 40% 100%, var(--peach-pale) 0%, transparent 70%),var(--warm);transition:opacity .2s ease;';
  loader.innerHTML = `<img src="${new URL('img/aghf-logo.png', scriptSrc).href}" alt="" style="width:64px;height:64px;object-fit:contain;filter:drop-shadow(0 8px 20px rgba(244,130,154,.35));animation:aghfLoaderPulse 1.1s ease-in-out infinite;">`;
  document.body.appendChild(loader);

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

  // Hides and removes the branded loader. Exposed on window rather than
  // fired automatically alongside auth success, because auth passing
  // isn't the same as the page being ready to look at — every page's own
  // boot() still has to fetch and render its data after `aghf-auth-ready`
  // fires below, and that used to happen behind a revealed, half-built
  // page (skeletons popping in one card at a time). Each page's boot
  // listener now calls this itself once ITS OWN data has finished
  // rendering, so the loader stays up for the full wait, not just the
  // auth check.
  function hideLoader() {
    const loaderEl = document.getElementById('aghfLoader');
    if (loaderEl) {
      loaderEl.style.opacity = '0';
      loaderEl.style.pointerEvents = 'none';
      setTimeout(() => loaderEl.remove(), 220);
    }
  }
  window.AGHF_HIDE_LOADER = hideLoader;
  // Last-resort safety net: if a page's boot listener throws before its
  // own try/finally can call AGHF_HIDE_LOADER, or a page never registers
  // an `aghf-auth-ready` listener at all, don't leave the loader on
  // screen forever — hide it anyway after a generous window.
  setTimeout(hideLoader, 20000);

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
    document.body.style.visibility = '';
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

  /* ── Member data sync ─────────────────────────────────────────────
   * Some saved data (My AGHF Rulebook, its rule queue/history, trigger
   * responses and the Phase 6 risk profile) is read and written by the pages
   * in localStorage. This keeps an account copy (api/psychology-data.js
   * ?resource=member-data, table member_data) so it follows her across
   * devices:
   *   - before a page draws, pull the account copy; the newer side wins
   *   - when a page saves one of these keys, AGHF_MEMBER_SYNC(key) pushes it
   *   - data already in this browser with no account copy is uploaded once
   * Any failure (offline, migration not applied) leaves the browser copy as is.
   */
  const SYNC_KEYS = ['aghf_rulebook', 'aghf_rule_queue', 'aghf_rule_history', 'aghf_rule_violations', 'aghf_trigger_responses', 'aghf_risk_profile'];
  const SYNC_META = 'aghf_sync_meta'; // { uid, keys: { [key]: updatedAt (ms) } }
  let syncToken = null;
  function readSyncMeta() {
    try { const m = JSON.parse(localStorage.getItem(SYNC_META)); if (m && typeof m === 'object') return { uid: m.uid || null, keys: m.keys || {} }; } catch { /* fall through */ }
    return { uid: null, keys: {} };
  }
  function writeSyncMeta(m) { try { localStorage.setItem(SYNC_META, JSON.stringify(m)); } catch { /* storage blocked */ } }
  function pushMemberKey(key, updatedAt) {
    if (!syncToken) return;
    let raw = null;
    try { raw = localStorage.getItem(key); } catch { return; }
    let value = null;
    try { value = raw == null ? null : JSON.parse(raw); } catch { return; }
    const body = JSON.stringify({ key, value, updatedAt });
    fetch(`${ROOT}api/member-data`, {
      method: 'PUT', keepalive: body.length < 60000,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + syncToken },
      body,
    }).catch(() => {});
  }
  // Called by the pages right after they save one of SYNC_KEYS.
  window.AGHF_MEMBER_SYNC = function (key) {
    if (!SYNC_KEYS.includes(key) || window.AGHF_DEMO) return;
    const meta = readSyncMeta();
    const now = Date.now();
    meta.keys[key] = now;
    writeSyncMeta(meta);
    pushMemberKey(key, now);
  };
  // Device-level keys that are not one member's data.
  const KEEP_ON_SWITCH = ['aghf_signed_in_before', SYNC_META];
  const STASH = 'aghf_stash:'; // aghf_stash:<uid> holds a member's browser data while someone else is signed in
  const isMemberKey = (k) => !!k && k.startsWith('aghf') && !k.startsWith(STASH) && !k.startsWith('aghf_whop_ok:') && !KEEP_ON_SWITCH.includes(k);
  function switchMemberData(fromUid, toUid) {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i += 1) keys.push(localStorage.key(i));
      // Set the previous member's data aside (not deleted), so it is back when she signs in again.
      const stash = {};
      keys.filter(isMemberKey).forEach((k) => { stash[k] = localStorage.getItem(k); localStorage.removeItem(k); });
      if (fromUid && Object.keys(stash).length) {
        try { localStorage.setItem(STASH + fromUid, JSON.stringify(stash)); } catch { /* full: dropped rather than shown to someone else */ }
      }
      // Bring back this member's own data, if she used this browser before.
      const mine = localStorage.getItem(STASH + toUid);
      if (mine) {
        Object.entries(JSON.parse(mine)).forEach(([k, v]) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } });
        localStorage.removeItem(STASH + toUid);
      }
    } catch { /* storage blocked */ }
    try {
      const keys = [];
      for (let i = 0; i < sessionStorage.length; i += 1) keys.push(sessionStorage.key(i));
      keys.filter((k) => k && k.startsWith('aghf') && k !== 'aghf_demo').forEach((k) => sessionStorage.removeItem(k));
    } catch { /* storage blocked */ }
  }
  async function pullMemberData(uid, token) {
    syncToken = token;
    let meta = readSyncMeta();
    if (meta.uid && meta.uid !== uid) {
      // A different member signed in on this browser. Everything the pages keep in this
      // browser (progress, notes, badges, games, rulebook...) belongs to the previous member:
      // set it aside rather than show it to, or upload it into, this account.
      switchMemberData(meta.uid, uid);
      meta = { uid, keys: {} };
    }
    meta.uid = uid;
    // Moving between pages: one pull every 30 seconds per tab is plenty.
    try {
      const last = JSON.parse(sessionStorage.getItem('aghf_sync_pulled') || 'null');
      if (last && last.uid === uid && Date.now() - last.at < 30000) { writeSyncMeta(meta); return; }
    } catch { /* ignore */ }
    try {
      const r = await withTimeout(fetch(`${ROOT}api/member-data`, { headers: { Authorization: 'Bearer ' + token } }), 4000, 'member data timeout');
      if (!r.ok) { writeSyncMeta(meta); return; }
      const { items = {} } = await r.json();
      SYNC_KEYS.forEach((k) => {
        const server = items[k];
        let local = null;
        try { local = localStorage.getItem(k); } catch { /* ignore */ }
        const localAt = meta.keys[k] || 0;
        if (server && server.updatedAt > localAt) {
          try {
            if (server.value == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(server.value));
          } catch { /* ignore */ }
          meta.keys[k] = server.updatedAt;
        } else if (local != null && (!server || localAt > server.updatedAt)) {
          meta.keys[k] = localAt || Date.now();
          pushMemberKey(k, meta.keys[k]);
        }
      });
      try { sessionStorage.setItem('aghf_sync_pulled', JSON.stringify({ uid, at: Date.now() })); } catch { /* ignore */ }
    } catch { /* offline or not migrated: keep the browser copy */ }
    writeSyncMeta(meta);
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
      // Remember that this device has signed in, so login.html shows "Welcome back" next time.
      try { localStorage.setItem('aghf_signed_in_before', '1'); } catch { /* storage blocked */ }
      window.AGHF_SESSION_TOKEN = session.access_token;
      window.AGHF_SUPABASE = supabaseClient;

      // Members sign in with Whop. About twice a day, re-check with Whop that the membership is
      // still active (api/whop.js). Never blocks the page; a network or server problem keeps
      // the member in, and a confirmed inactive membership signs them out.
      try {
        const key = 'aghf_whop_ok:' + session.user.id;
        if (Date.now() - (+localStorage.getItem(key) || 0) > 12 * 3600 * 1000) {
          fetch(`${ROOT}api/whop?action=check`, { method: 'POST', headers: { Authorization: 'Bearer ' + session.access_token } })
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => {
              if (!j) return;
              if (j.active) { localStorage.setItem(key, String(Date.now())); return; }
              supabaseClient.auth.signOut().finally(() => { window.location.href = `${ROOT}login.html?whop=inactive`; });
            })
            .catch(() => {});
        }
      } catch { /* storage blocked: skip the check this time */ }

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
        if (newSession) { window.AGHF_SESSION_TOKEN = newSession.access_token; syncToken = newSession.access_token; }
      });

      await pullMemberData(session.user.id, session.access_token);

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
