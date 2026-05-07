# LeetCode Learning Tracker

個人用的 LeetCode 學習追蹤系統：Chrome Extension 會從 LeetCode 題目頁擷取題目資訊、程式碼與 tags，送進 Supabase；Next.js Dashboard 用來檢視題庫、複習狀態、解法筆記與練習趨勢。

## Features

- Dashboard 顯示目前題庫總覽、難度分布、活動 heatmap、tags 統計與 Google SWE 目標提醒。
- 題庫頁支援搜尋、難度、熟練度與 tags 篩選。
- 題目詳情頁顯示難度、熟練度、tags、複習建議、程式碼與 Markdown 筆記。
- Chrome Extension 可手動擷取目前 LeetCode 題目。
- 按 LeetCode `Submit` 後，若結果為 `Accepted`，Extension 會自動同步到 Dashboard。
- Extension 會透過 LeetCode GraphQL 抓官方 `topicTags`，並用 Monaco API 擷取較完整的程式碼。
- Webhook 會清理 code fence、NBSP 空白，並修正常見語言標籤，例如 C++ 會存成 `cpp`。
- 支援 n8n workflow 轉發，也可直接打 Next.js `/api/webhook`。

## Tech Stack

| Area | Tech |
|---|---|
| App | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui |
| Charts | Recharts |
| Database | Supabase PostgreSQL |
| Extension | Chrome Extension Manifest V3, esbuild |
| Automation | n8n webhook workflow |

## Project Structure

```text
vibe-leetcode/
  extension/                    Chrome Extension
    manifest.json
    popup.html
    build.js
    src/
      popup.ts
      content.ts
      main_world.ts             MAIN world script for Monaco access
  n8n/
    workflow_leetcode_tracker.json
  supabase/
    schema.sql
  src/
    app/                        Next.js routes and API
    components/                 UI components
    hooks/
    lib/
```

## Setup

Install dependencies:

```bash
npm install
```

Create local env:

```bash
cp .env.local.example .env.local
```

Required env values:

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

Then start the app:

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
5. Open the extension popup and fill:
   - Webhook URL, for local direct mode: `http://localhost:3000/api/webhook`
   - Secret: same value as `WEBHOOK_SECRET`

After updating extension code, rebuild and reload the unpacked extension in `chrome://extensions/`.

## Sync Flow

Manual sync:

```text
LeetCode page -> Extension popup button -> Webhook -> Supabase -> Dashboard
```

Auto sync:

```text
LeetCode Submit -> wait for Accepted -> Extension auto POST -> Webhook -> Supabase
```

The extension skips failed submissions such as Wrong Answer, Runtime Error, Compile Error and TLE.

## Webhook Payload

```json
{
  "problem_id": 567,
  "title": "Permutation in String",
  "difficulty": "Medium",
  "tags": ["Hash Table", "Two Pointers", "String", "Sliding Window"],
  "code": "class Solution { ... }",
  "language": "cpp",
  "lc_slug": "permutation-in-string"
}
```

## n8n Workflow

`n8n/workflow_leetcode_tracker.json` contains a simple workflow:

```text
Webhook -> Forward to Next.js API -> Respond
```

For local development, forwarding target is:

```text
http://localhost:3000/api/webhook
```

If you do not need n8n, point the Chrome Extension directly to the Next.js API URL.

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
  lc_slug       text,
  created_at    timestamptz,
  updated_at    timestamptz
)
```

## Scripts

```bash
npm run dev        # Start Next.js dev server
npm run build      # Production build
npm run lint       # ESLint
npm run ext:build  # Build Chrome Extension dist files
```

## Current Status

- [x] Dashboard with Supabase data
- [x] Problem list and filters
- [x] Problem detail page with notes and code display
- [x] Chrome Extension manual capture
- [x] Accepted submission auto sync
- [x] LeetCode tags and language cleanup
- [x] n8n forwarding workflow
