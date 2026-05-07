# LeetCode Learning Tracker

A personal LeetCode learning tracker. The Chrome extension captures problem metadata, tags, code, and accepted submissions from LeetCode, then sends them to a Next.js webhook and stores them in Supabase. The dashboard helps track progress, review status, solutions, notes, and Google SWE preparation goals.

## Features

- Dashboard backed by Supabase records.
- Problem list with search, difficulty, proficiency, and tag filters.
- Problem detail page with tags, review status, solutions, code blocks, and notes.
- Manual capture from the Chrome extension popup.
- Automatic sync after a LeetCode `Submit` returns `Accepted`.
- LeetCode GraphQL metadata fetch for official `topicTags`.
- Monaco editor extraction for cleaner submitted code capture.
- Language cleanup, including `python3 -> python` and `C++ -> cpp`.
- Webhook cleanup for code fences, non-breaking spaces, and invisible characters.
- Optional n8n forwarding workflow.

## Tech Stack

| Area | Tech |
| --- | --- |
| App | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui |
| Charts | Recharts |
| Database | Supabase PostgreSQL |
| Extension | Chrome Extension Manifest V3, esbuild |
| Automation | n8n webhook workflow |

## Project Structure

```text
vibe-leetcode/
  extension/
    manifest.json
    popup.html
    build.js
    src/
      background.ts      # Extension service worker for webhook POST
      content.ts         # LeetCode page extraction and auto-sync trigger
      main_world.ts      # MAIN world network/Monaco intercepts
      popup.ts           # Manual capture popup
  n8n/
    workflow_leetcode_tracker.json
  supabase/
    schema.sql
  src/
    app/
      api/webhook/route.ts
      page.tsx
      problems/
    components/
    hooks/
    lib/
```

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Required values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
WEBHOOK_SECRET=your-random-secret
NEXT_PUBLIC_USE_MOCK=false
```

Create the Supabase table by running:

```text
supabase/schema.sql
```

Start the app:

```bash
npm run dev
```

Open:

[http://localhost:3000](http://localhost:3000)

## Chrome Extension

Build the extension:

```bash
npm run ext:build
```

Load it in Chrome:

1. Open `chrome://extensions/`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the `extension/` folder.
5. Open the extension popup and set:
   - Webhook URL: `http://localhost:3000/api/webhook`
   - Secret: the same value as `WEBHOOK_SECRET`

After changing extension code, always run `npm run ext:build`, then reload the unpacked extension in `chrome://extensions/`.

## Sync Flow

Manual capture:

```text
LeetCode problem page
  -> Extension popup capture
  -> Next.js /api/webhook
  -> Supabase
  -> Dashboard
```

Accepted submission auto sync:

```text
LeetCode Submit
  -> MAIN world script intercepts submit/check requests
  -> content script waits for Accepted
  -> background service worker POSTs webhook
  -> Supabase
  -> Dashboard
```

The background service worker performs the webhook POST so the LeetCode page itself does not need to call `localhost` directly.

Failed submissions such as Wrong Answer, Runtime Error, Compile Error, and TLE are ignored.

## Webhook Payload

```json
{
  "problem_id": 1,
  "title": "Two Sum",
  "difficulty": "Easy",
  "tags": ["Array", "Hash Table"],
  "code": "class Solution { ... }",
  "language": "cpp",
  "lc_slug": "two-sum"
}
```

`lc_slug` may be present in the payload, but the webhook does not require the database table to have an `lc_slug` column. This keeps older Supabase schemas working.

## n8n Workflow

`n8n/workflow_leetcode_tracker.json` contains a simple forwarding workflow:

```text
Incoming webhook -> Forward to Next.js /api/webhook -> Respond
```

For local development, the forwarding target is:

```text
http://localhost:3000/api/webhook
```

If n8n is not needed, point the Chrome extension directly to the Next.js webhook URL.

## Database Schema

Main table:

```sql
leetcode_records (
  id            uuid primary key,
  problem_id    integer unique,
  title         text,
  difficulty    text,       -- Easy | Medium | Hard
  tags          text[],
  proficiency   text,       -- 生疏 | 理解 | 熟練
  solutions     jsonb,      -- [{ method, code, language, time_complexity, space_complexity, notes }]
  lc_slug       text,       -- optional; webhook also works without this column
  created_at    timestamptz,
  updated_at    timestamptz
)
```

## Troubleshooting

If auto sync does not run, open DevTools on the LeetCode page and filter Console logs by `LC Tracker`.

Expected logs after reloading a LeetCode page:

```text
[LC Tracker] main world loaded
[LC Tracker] content script loaded
```

Expected logs after an accepted submission:

```text
[LC Tracker] Submission status: Accepted
[LC Tracker] auto sync sending: 1 Two Sum
[LC Tracker] auto sync completed: 1 Two Sum
```

Common fixes:

- If no `LC Tracker` logs appear, reload the extension in `chrome://extensions/`.
- If webhook returns `401`, make sure the popup Secret matches `WEBHOOK_SECRET`.
- If webhook returns `500`, check the JSON error body in the LeetCode Console.
- If the dashboard does not update, refresh `http://localhost:3000` and confirm `NEXT_PUBLIC_USE_MOCK=false`.

## Scripts

```bash
npm run dev        # Start Next.js dev server
npm run build      # Production build
npm run lint       # ESLint
npm run ext:build  # Build Chrome extension dist files
```

## Current Status

- [x] Dashboard with Supabase data
- [x] Problem list and filters
- [x] Problem detail page with notes and code display
- [x] Chrome extension manual capture
- [x] Accepted submission auto sync
- [x] Background service worker webhook sync
- [x] LeetCode tags and language cleanup
- [x] n8n forwarding workflow
