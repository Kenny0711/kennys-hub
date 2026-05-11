# Kenny's Hub

Kenny's Hub 是一個個人研發門戶，整合作品集、LeetCode 訓練紀錄、研究專案與工程筆記。

目前的線上版本仍是：

```txt
https://vibe-leetcode.vercel.app
```

> 注意：GitHub repo / 本機資料夾已改名為 `kennys-hub`。Vercel 網址是否改名，要另外到 Vercel 專案設定處理。

---

## 這個專案在做什麼

你可以把它想成「自己的技術履歷網站 + 刷題紀錄系統 + 小型作品集 CMS」。

首頁包含：

- Hero 自我介紹與擅長語言。
- 技術歷程時間軸。
- 精選作品集。

後台包含：

- `/login`：輸入管理密碼。
- `/admin/projects`：管理作品、切換 Featured 星號。

LeetCode 系統包含：

- `/dashboard`：刷題統計。
- `/problems`：題庫列表。
- `/problems/[id]`：題目詳情與解法筆記。
- `/api/webhook`：Chrome Extension 寫入解題資料。

---

## 架構圖

```txt
使用者瀏覽器
  -> Next.js App Router
  -> Server Components 讀資料
  -> Supabase PostgreSQL

管理者瀏覽器
  -> /login
  -> admin_auth_token HttpOnly Cookie
  -> /admin/projects
  -> Server Actions
  -> SUPABASE_SERVICE_ROLE_KEY
  -> Supabase projects table

LeetCode 題目頁
  -> Chrome Extension
  -> /api/webhook
  -> WEBHOOK_SECRET 驗證
  -> Supabase leetcode_records table
```

重點：

- 前端不能拿 `SUPABASE_SERVICE_ROLE_KEY`。
- 後台寫入都走 Server Actions。
- Server Actions 會先驗證 admin cookie。
- `projects` 表可以開 RLS，因為寫入由 server 端 service role key 處理。

---

## 環境變數

建立 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

WEBHOOK_SECRET=dev-secret
NEXT_PUBLIC_USE_MOCK=false
ADMIN_PASSWORD=change-this-password
```

| 變數 | 用途 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 前端可用的 Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Actions 寫資料庫用，不能外洩 |
| `WEBHOOK_SECRET` | Extension 打 `/api/webhook` 的驗證密碼 |
| `NEXT_PUBLIC_USE_MOCK` | 是否使用 mock data |
| `ADMIN_PASSWORD` | `/login` 後台登入密碼 |

---

## 本機啟動

```bash
npm install
npm run dev
```

打開：

```txt
http://localhost:3000
```

檢查：

```bash
npm run lint
npm run build
```

---

## Supabase

到 Supabase SQL Editor 執行：

```txt
supabase/schema.sql
```

主要資料表：

- `leetcode_records`：刷題紀錄。
- `projects`：作品集資料。

第一次沒有作品資料時，可以到 `/admin/projects` 使用「同步目前作品到 Supabase」。

---

## 常用路由

| 路由 | 用途 |
|---|---|
| `/` | 個人門戶首頁 |
| `/projects` | 全作品頁 |
| `/dashboard` | LeetCode Dashboard |
| `/problems` | 題庫列表 |
| `/login` | 管理登入 |
| `/admin/projects` | 作品管理 |
| `/api/webhook` | Extension 寫入解題紀錄 |

---

## 專案結構

```txt
kennys-hub/
├── extension/               Chrome Extension
├── log/                     學習紀錄與 code review 筆記
├── public/projects/         作品集 SVG 封面
├── src/
│   ├── actions/             Server Actions
│   ├── app/                 Next.js routes
│   ├── components/          UI components
│   └── lib/                 Supabase、auth、types、data helpers
└── supabase/                SQL schema / seed
```

---

## Code Review 建議

如果你未來要回來看這個專案，建議先讀：

1. `log/README.md`
2. `log/08_Code_Review_小白指南.md`
3. `log/09_DevHub_作品集與後台.md`

Review 時問自己：

- 這段 code 是 UI、server 邏輯，還是資料庫設定？
- 有沒有把 secret key 放到前端？
- 寫入資料前有沒有驗證權限？
- 改資料庫時，TypeScript type 有沒有一起更新？
- 改 UI 後手機版會不會壞？

---

## GitHub Repo Rename

本機資料夾已改成：

```txt
D:\vibe coding\kennys-hub
```

建議 GitHub repo slug 使用：

```txt
kennys-hub
```

因為 GitHub repository URL 不適合使用空白或 apostrophe。網站顯示名稱仍可寫成 `Kenny's Hub`。
