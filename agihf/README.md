# A Girl & Her Futures™ — Gamified Trading Platform

A gamified, phase-based futures trading education platform built with plain HTML, CSS, and JavaScript.

## Project Structure

```
agihf/
├── index.html                        # Main platform prototype (home, login, signup, dashboard)
├── phases/
│   ├── phase-1/                      # Phase 1: Trading Foundations
│   │   ├── index.html                # Phase 1 overview & lesson nav
│   │   └── lessons/
│   │       ├── lesson-01-what-is-trading.html
│   │       ├── lesson-02-why-markets-exist.html
│   │       ├── lesson-03-buyers-vs-sellers.html
│   │       ├── lesson-04-contracts-instruments.html
│   │       ├── lesson-05-futures-vs-stocks.html
│   │       ├── lesson-06-how-traders-get-paid.html
│   │       ├── lesson-07-tradingview-basics.html
│   │       ├── lesson-08-timeframes-perspective.html
│   │       ├── lesson-09-brokers-prop-firms.html
│   │       ├── lesson-10-orders-how-you-enter.html
│   │       ├── lesson-11-stop-loss-take-profit.html
│   │       └── lesson-12-position-sizing.html
│   └── phase-2/                      # Phase 2: ICC Framework (coming soon)
│       └── lessons/
└── assets/
    ├── css/                          # Shared stylesheets (future)
    └── js/                           # Shared scripts (future)
```

## Phases Roadmap

| Phase | Title | Status |
|-------|-------|--------|
| Phase 1 | Trading Foundations | ✅ Complete (12 lessons) |
| Phase 2 | ICC Framework | 🔜 In Progress |
| Phase 3 | Reading Structure | 🔜 Planned |
| Phase 4 | Trade Execution | 🔜 Planned |

## Tech Stack

- Plain HTML5, CSS3, JavaScript (no framework, no build step)
- Google Fonts: Playfair Display, DM Sans
- Deployed via GitHub Pages

## Brand Colors

| Name | Hex |
|------|-----|
| Pink | `#F4829A` |
| Teal | `#7ECEC4` |
| Peach | `#F5A857` |
| Cream | `#FDF8F5` |
| Dark | `#2C1810` |

## Business Dashboard (Whop integration)

`business-dashboard.html` is an admin-only page (gated by `profiles.is_admin`,
same mechanism as `admin-wins.html`) that tracks Whop members and revenue in
one place — active members, new/churned this week & month, revenue
today/this week/this month, a 30-day revenue chart, and a live activity feed
— so you're not digging through Whop's own UI to answer "how much came in
this week" or "who fell off."

Data flows in two ways, both handled by `api/billing-data.js`:

1. **Whop webhooks (real-time, primary source).** Every membership/payment
   event Whop sends updates the dashboard immediately.
2. **"Sync now" button (backfill/reconciliation).** A best-effort pull from
   Whop's REST API, mainly for backfilling members who joined before the
   webhook existed.

### Setup

1. Run `supabase/migrations/0011_whop_business_dashboard.sql` against your
   Supabase project (SQL editor, or `supabase db push`).
2. Make sure your own profile row has `is_admin = true` (see the note in
   `0007_share_my_win.sql` if you haven't set this before).
3. In your Whop dashboard, create a webhook endpoint pointing at
   `https://<your-domain>/api/whop-webhook`, subscribed to the
   membership and payment events (`membership.went_valid`,
   `membership.went_invalid`/`cancelled`/`expired`, `payment.succeeded`,
   `payment.failed` — exact names may vary slightly by account, subscribe to
   whatever your dashboard offers under those two categories). Copy the
   signing secret it gives you.
4. Set these environment variables in your Vercel project:
   - `WHOP_WEBHOOK_SECRET` — the signing secret from step 3.
   - `WHOP_API_KEY` — a company API key from your Whop business settings
     (only needed for the "Sync now" backfill button).
   - `WHOP_COMPANY_ID` — your Whop company id (optional, improves sync
     accuracy if your account has more than one company).
   - `WHOP_AMOUNT_IN_CENTS` — leave unset (defaults to treating Whop payment
     amounts as cents, like Stripe). Set to `false` if dashboard revenue
     numbers look exactly 100x too high.
5. Visit `/business-dashboard.html` and click **Sync now** once to backfill
   existing members — after that, webhooks keep it current on their own.

Whop's public API has gone through a few versions, so the "Sync now" pull is
intentionally defensive: if it errors, the exact error message from Whop
shows up right on the dashboard (check it against
[docs.whop.com/api-reference](https://docs.whop.com/api-reference)) rather
than failing silently. The webhook path — which is what actually keeps the
dashboard "live" — follows Whop's public Standard Webhooks signing scheme
and doesn't depend on API versioning.

---

*Built by Dayli Scott — A Girl & Her Futures™*
