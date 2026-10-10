/**
 * whop-checkout.js: A Girl & Her Futures™
 *
 * The Whop checkout link for each plan, in one place. Any link or button with
 * data-whop="academy" or data-whop="indicator" gets its href set to the matching
 * link (used by the homepage plans and the "You're almost in" screen on login).
 * Until a link is filled in, those buttons keep their fallback href.
 */
(function () {
  var WHOP_CHECKOUT = {
    academy: null,   // The Academy, $49.99/mo
    indicator: null, // Academy + Dayli ICC Indicator, $64.99/mo
  };
  window.AGHF_WHOP_CHECKOUT = WHOP_CHECKOUT;
  function apply() {
    document.querySelectorAll('[data-whop]').forEach(function (a) {
      var url = WHOP_CHECKOUT[a.getAttribute('data-whop')];
      if (url) a.href = url;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
