# Newsletter scheduling

Drafts live in `drafts/*.md`. A GitHub Actions workflow
(`.github/workflows/newsletter-schedule.yml`) runs every 6 hours, finds any
draft with `status: draft`, and registers it as a scheduled broadcast with
Kit (formerly ConvertKit) via their API. Kit sends the email at `send_at` —
this automation only has to run once per draft to hand it off.

## One-time setup

1. In Kit: Settings → Advanced → API, copy your **API Key**.
2. In the GitHub repo: Settings → Secrets and variables → Actions → New
   repository secret. Name it `KIT_API_KEY`, paste the key.

That's the only manual step. Everything else is automatic.

## Draft format

```markdown
---
subject: "This week's market recap"
send_at: 2026-09-20T14:00:00Z
status: draft
---

Body copy goes here. Plain paragraphs, separated by a blank line, are
converted to HTML automatically. You can also write raw HTML directly if
you want more control over formatting.
```

- `subject` — the email subject line.
- `send_at` — ISO 8601 timestamp (UTC), must be in the future.
- `status` — start every new draft at `draft`. The automation updates this
  itself:
  - `scheduled` — successfully handed off to Kit, includes a `broadcast_id`.
  - `error` — the API call failed; check `error_message` in the file, fix
    the draft, and set `status` back to `draft` to retry.

Once a draft reaches `scheduled` or `error`, the automation leaves it alone
— editing the file again has no effect unless you reset `status` to `draft`.

## Testing without sending anything

Run the workflow manually (Actions tab → "Schedule newsletter broadcasts" →
Run workflow) with **dry run** checked. It logs what it would schedule
without calling the Kit API or changing any files.

You can also run it locally:

```
KIT_API_KEY=xxx DRY_RUN=true node newsletter/scripts/schedule-broadcasts.mjs
```
