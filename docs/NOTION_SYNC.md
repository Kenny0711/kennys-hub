# LeetCode ↔ Notion synchronization

This integration extends the existing Accepted webhook. It does not replace the Chrome extension, the Supabase problem archive, or the Notion Problem Tracker.

## Ownership and behavior

| Direction | Fields |
|---|---|
| Hub → Notion | LeetCode ID, Name, Date Solved (only when blank), Topic, LeetCode URL, Language, Problem Progress |
| Notion → Hub cache | Difficulty Level, Time Complexity, Space Complexity, Notes property and page body |

Hub never writes Notion difficulty, complexity, Notes, or page body after creating an empty `解題心得` section. Notion never writes solution code, submissions, tags or title in Supabase. The separate C++ Blog and review checklist are untouched.

`Date Solved` uses the first **verified Accepted submission timestamp**, converted to a date in `Asia/Taipei`. A later Accepted does not replace an existing date, including historical dates already entered in Notion. Legacy solutions whose actual submission timestamp was not captured do not supply a date. If a Notion field is explicitly cleared, the Hub cache is cleared too. A missing property or incomplete markdown response does not erase the last good value. Once linked, clearing Notion difficulty displays `未設定` on the detail page rather than the old LeetCode value.

The current Notion data source already has `Name`, `Date Solved`, `Topic`, `LeetCode URL`, `Language`, `Problem Progress`, `Difficulty Level`, `Time Complexity`, `Space Complexity`, and `Notes`. It lacks a numeric `LeetCode ID`; adding that property is the only Notion schema change. Historical pages are initially matched by an exact leading number such as `1146.`; thereafter the numeric property and stable page ID are used. Ambiguous matches fail safely.

## Architecture

1. The extension sends an Accepted submission ID and timestamp to `/api/webhook`. A Supabase function atomically appends the solution and ignores repeated submission IDs.
2. The webhook enqueues the problem in `notion_problem_sync` and returns the Hub save result. Next.js `after()` attempts an immediate push. If Notion fails, the durable queue retains the work with capped exponential backoff.
3. A PostgreSQL lease (`FOR UPDATE SKIP LOCKED`) lets only one worker claim a problem at a time. A generation counter prevents a newer Accepted event being marked complete by an older worker. Before creating a page, the worker searches by `LeetCode ID`, then by exact numeric title prefix for legacy pages. It patches only changed Hub-owned fields.
4. Verified Notion `page.properties_updated`, `page.content_updated`, and `page.created` events fetch the current page and check its data source before caching Notion-owned fields. Event payload parents are not used for this check. The official page-to-markdown endpoint preserves headings, lists and fenced code. Incomplete or failed markdown reads leave the last good snapshot intact for a later retry. The UI renders cached markdown without raw HTML.
5. A daily Vercel Cron compares each verified Accepted record's `updated_at` with `last_pushed_record_at` to recover missed queue insertion, including subsequent Accepted submissions on an already-linked problem. It also retries queued pushes and reconciles Notion pages if a webhook was missed. It does **not** bulk-create historical pages without submission IDs. The cron frequency is daily to work on Vercel Hobby; higher-frequency polling requires a compatible plan.

The Notion token, webhook verification token, cron secret and Supabase service-role key stay server-side. No `NEXT_PUBLIC_` Notion variables are used.

## Setup

1. In Supabase SQL Editor, review and apply `supabase/migrations/20261018_notion_problem_sync.sql`. It adds `notion_problem_sync`, an admin-only webhook setup table and the atomic/queue functions. It does not modify existing solutions or Notion data.
2. Create a Notion **internal integration** with read content, insert content and update content capabilities. Share the existing Problem Tracker database with that integration. Do not create another database.
3. Set `NOTION_TOKEN` and `NOTION_DATA_SOURCE_ID=e289c794-45ba-83a9-ab9e-0719abda17bc` in local and Vercel server-side environment settings. Redeploy after Vercel environment changes.
   Also replace any `dev-secret` webhook value with a random `WEBHOOK_SECRET` of at least 16 characters in Vercel, and enter the same value in the extension popup. Notion-enabled Accepted writes reject a missing or weak webhook secret.
4. Run `node --env-file=.env.local scripts/notion-schema.mjs` to preview the one-column change. After reviewing it, run `node --env-file=.env.local scripts/notion-schema.mjs --apply --confirm=ADD_LEETCODE_ID`. Alternatively add a Number property named exactly `LeetCode ID` in Notion manually. Existing views and other properties remain intact.
5. Set a random `CRON_SECRET` (at least 16 characters) in Vercel. Vercel sends it as a Bearer token to `/api/cron/notion-sync` on the schedule in `vercel.json`.
6. In the Notion integration's Webhooks tab, subscribe to `page.properties_updated`, `page.content_updated` and `page.created` at `https://vibe-leetcode.vercel.app/api/notion/webhook`. The initial verification request stores its one-time token in a Supabase table readable only by the server. While logged into the Hub admin account, open `/api/admin/notion-verification` to read the token, then paste it into Notion's Verify dialog. Set the same value as `NOTION_WEBHOOK_VERIFICATION_TOKEN` in Vercel and redeploy. The endpoint does not print the token in logs, and normal events reject missing/invalid HMAC signatures. Remove the setup row from Supabase after verification if desired.

`NOTION_SYNC_SECRET` is not needed: the admin session protects manual backfill, `CRON_SECRET` protects cron, and Notion's verification token protects its webhook.

## Historical backfill (dry-run first)

While logged into the Hub admin account, visit `/api/admin/notion-backfill` with a GET request. It returns `schema_ready` and a per-problem plan: `link_and_update_hub_fields`, `create`, `ambiguous`, or `skip_unverified`. The GET request **does not write** to Notion or the queue. Inspect 1146, 2080, 2563 and 3488; resolve any ambiguous matches in Notion before applying.

To apply selected IDs, send an authenticated POST from the same logged-in browser session:

```js
await fetch('/api/admin/notion-backfill', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    confirmation: 'APPLY_NOTION_BACKFILL',
    problem_ids: [1146],
  }),
}).then((response) => response.json())
```

Each request accepts 1–20 IDs. Only records with an Accepted solution and unambiguous mapping can be queued. Existing Notion reflections and complexity fields are never in the outbound payload. The immediate worker handles a few items; remaining work is retried by cron. Repeat the dry-run and apply in batches only after inspecting the previous result.

## Verify with problem 1146

1. Check the dry-run result for `1146`; it should identify the existing `1146. Snapshot Array` Notion page, not propose a duplicate. If the Hub lacks 1146, submit a verified Accepted solution first.
2. Apply only `[1146]`, or submit another Accepted solution. Confirm the Hub saves the code even if Notion is unavailable.
3. Confirm Notion's `LeetCode ID` is `1146`, Name/URL/Topic/Language reflect LeetCode, and any existing `Date Solved` remains unchanged.
4. In Notion, edit `Difficulty Level`, complexity options, the `Notes` property or page body. Wait for the webhook, then reload the Hub's `/problems/[id]` page (the URL uses the Supabase record UUID). Verify the updated fields, formatted notes and `Edit notes in Notion` link.
5. Submit the same Accepted submission again. Confirm there is still one Notion page and no duplicate solution with the same submission ID.

## Troubleshooting

- **No new page:** check `NOTION_TOKEN`, data source sharing, numeric `LeetCode ID` property, the `notion_problem_sync.last_error` column and Vercel function logs. A missing/invalid token never blocks the Hub solution save.
- **No updated notes:** check Notion webhook subscription, `NOTION_WEBHOOK_VERIFICATION_TOKEN`, HMAC signature failures and page access. The daily cron is a fallback; it is not immediate on Vercel Hobby.
- **Unknown date:** older extension builds did not send the Accepted timestamp. Rebuild/reload the extension (`npm run ext:build`) and submit a new Accepted solution. Do not use sync time as a substitute.
- **Complexity not in dropdown:** Notion's `Time Complexity` and `Space Complexity` are multi-select fields. Add the exact desired option in Notion; the Hub displays the complete selected string without simplification. The integration never creates a guessed option.
- **Ambiguous match:** two Notion pages share one numeric ID or title prefix. Resolve manually; the worker deliberately refuses to choose one or create a third.
- **Partial notes:** Notion markdown responses marked truncated/unknown are not committed to cache, so the last complete notes remain visible.
