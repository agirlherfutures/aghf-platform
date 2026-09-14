# Whop Dashboard

A small standalone app that tracks Whop members and revenue in real time —
active members, new/churned this week & month, revenue today/this
week/this month, a 30-day revenue chart, and a live activity feed. Fully
separate from the AGHF academy site: its own folder, its own Vercel
project, its own login. It shares nothing with `agihf/` except the same
Supabase project (just a few extra tables in it).

Data flows in two ways, both in `api/`:

1. **`whop-webhook.js` (real-time, primary source).** Every membership/
   payment event Whop sends updates the dashboard immediately.
2. **`sync.js`, the "Sync now" button (backfill/reconciliation).** A
   best-effort pull from Whop's REST API, mainly for backfilling members
   who joined before the webhook existed.

Login is a single shared password (`DASHBOARD_PASSWORD`) — there's no
per-user accounts, since this is a one-owner tool. See `api/_lib/session.js`.

## Setup

### 1. Database (one-time, shared with the rest of this repo)

Run `supabase/migrations/0011_whop_business_dashboard.sql` against your
Supabase project (SQL editor, or `supabase db push`), if you haven't
already. It only adds new `whop_*` tables — it doesn't touch anything the
AGHF academy site uses.

### 2. Create a new Vercel project for this folder

This needs to be its **own** Vercel project (not the same one as the AGHF
academy site), pointed at this subfolder of the repo:

1. In Vercel, click **Add New → Project**.
2. Import this same GitHub repo again.
3. Under **Root Directory**, click Edit and set it to `whop-dashboard`.
4. Deploy. Vercel will give it its own URL, e.g. `whop-dashboard.vercel.app`
   (or add a custom domain afterward under Settings → Domains).

### 3. Environment variables

In that new Vercel project's **Settings → Environment Variables**, add:

| Variable | Where it comes from |
|---|---|
| `SUPABASE_URL` | Same value as the AGHF project's Supabase URL |
| `SUPABASE_SERVICE_KEY` | Same value as the AGHF project's Supabase service-role key |
| `DASHBOARD_PASSWORD` | Pick a password — this is what you'll type in to log in |
| `DASHBOARD_SESSION_SECRET` | A long random string, e.g. run `openssl rand -hex 32` locally and paste the result |
| `WHOP_WEBHOOK_SECRET` | From step 4 below |
| `WHOP_API_KEY` | A company API key from your Whop business settings (only needed for "Sync now") |
| `WHOP_COMPANY_ID` | Your Whop company id (optional) |
| `WHOP_AMOUNT_IN_CENTS` | Leave unset (default). Set to `false` if revenue numbers look exactly 100x too high. |

Redeploy after adding these (Deployments → ⋯ on the latest → Redeploy).

### 4. Whop webhook

In your Whop dashboard → company Settings → **Webhooks** (or Developer
settings):

1. Create a new webhook endpoint pointing at:
   ```
   https://<your-new-vercel-url>/api/whop-webhook
   ```
2. Subscribe to the membership events (`membership.went_valid`,
   `membership.went_invalid`/`cancelled`/`expired`) and payment events
   (`payment.succeeded`, `payment.failed`) — exact names may vary slightly
   by account, enable whatever your dashboard offers under those two
   categories.
3. Copy the signing secret it shows you into `WHOP_WEBHOOK_SECRET` (step 3).

### 5. First backfill

Visit your new URL, log in with `DASHBOARD_PASSWORD`, and click **Sync
now** once to backfill members who joined before the webhook existed.
After that, the webhook keeps everything current on its own.

Whop's public API has gone through a few versions, so the "Sync now" pull
is intentionally defensive: if it errors, the exact error message from
Whop shows up right on the dashboard (check it against
[docs.whop.com/api-reference](https://docs.whop.com/api-reference)) rather
than failing silently. The webhook path — what actually keeps the
dashboard "live" — follows Whop's public Standard Webhooks signing scheme
and doesn't depend on API versioning.
