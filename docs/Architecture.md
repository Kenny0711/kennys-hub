# Architecture

這份文件記錄 Kenny's Hub 的架構、資料流、使用方式與部署注意事項。

README.md 負責回答「這個網站在幹嘛」。  
docs/Architecture.md 負責回答「這個網站怎麼做、怎麼跑、怎麼維護」。

---

## 1. 專案定位

Kenny's Hub 是一個 Next.js App Router 專案，整合三個子系統：

1. 作品集系統
2. LeetCode 訓練追蹤系統
3. 管理後台

資料庫使用 Supabase PostgreSQL。  
前端部署目標是 Vercel。  
LeetCode 資料來源是 Chrome Extension。

---

## 2. 技術棧

| 類別 | 技術 |
|---|---|
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS |
| Database | Supabase PostgreSQL |
| Auth | 自訂 Admin Cookie |
| Mutations | Server Actions |
| Extension | Chrome Extension Manifest V3 |
| Automation | n8n workflow |
| Deploy | Vercel |

---

## 3. 高層架構

```txt
使用者瀏覽器
  |
  | GET /
  v
Next.js Server Components
  |
  | 讀取 projects / leetcode_records
  v
Supabase PostgreSQL
```

```txt
管理者
  |
  | /login 輸入 ADMIN_PASSWORD
  v
admin_auth_token HttpOnly Cookie
  |
  | /admin/projects 操作作品
  v
Server Actions
  |
  | assertAdmin()
  | getSupabaseAdmin()
  v
Supabase projects table
```

```txt
LeetCode 題目頁
  |
  | Chrome Extension 擷取題目 / code / tags
  v
/api/webhook
  |
  | 驗證 WEBHOOK_SECRET
  v
Supabase leetcode_records table
```

---

## 4. 主要資料表

### leetcode_records

用途：儲存 LeetCode 題目與解法紀錄。

核心欄位：

- `problem_id`
- `title`
- `difficulty`
- `tags`
- `proficiency`
- `solutions`
- `lc_slug`
- `description`
- `created_at`
- `updated_at`

### projects

用途：儲存作品集資料。

核心欄位：

- `title`
- `description`
- `project_url`
- `image_url`
- `tags`
- `is_featured`
- `created_at`
- `updated_at`

首頁精選作品邏輯：

```txt
is_featured = true
order by created_at desc
limit 3
```

---

## 5. 權限與安全設計

### 為什麼不用前端直接寫 Supabase？

前端只能安全使用 anon key。  
如果讓前端直接 update `projects`，代表資料庫必須對 anon 開寫入權限，風險比較高。

所以後台寫入改成：

```txt
Client Component
  -> Server Action
  -> 檢查 admin cookie
  -> 使用 SUPABASE_SERVICE_ROLE_KEY
  -> 寫入 Supabase
```

### 重要檔案

```txt
src/actions/projects.ts
src/lib/supabase-admin.ts
src/lib/admin-auth.ts
middleware.ts
```

### Server Actions

`src/actions/projects.ts` 提供：

- `updateProject`
- `toggleFeatured`
- `syncProjects`

每個 action 都要先跑：

```ts
await assertAdmin();
```

寫入成功後會重新驗證快取：

```ts
revalidatePath('/');
revalidatePath('/projects');
revalidatePath('/admin/projects');
```

---

## 6. 目錄結構

```txt
kennys-hub/
├── README.md
├── docs/
│   ├── Architecture.md
│   └── log/
├── automation/
│   └── n8n/
├── extension/
├── public/
│   └── projects/
├── src/
│   ├── actions/
│   ├── app/
│   ├── components/
│   └── lib/
└── supabase/
    ├── schema.sql
    └── projects_seed.sql
```

分類原則：

- `src/`：網站程式碼。
- `public/`：靜態資產。
- `extension/`：Chrome Extension。
- `supabase/`：資料庫 schema 與 seed。
- `automation/`：n8n 等自動化 workflow。
- `docs/`：架構文件、學習紀錄、code review 筆記。

---

## 7. 本機使用方式

### 安裝

```bash
npm install
```

### 建立 .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

WEBHOOK_SECRET=dev-secret
NEXT_PUBLIC_USE_MOCK=false
ADMIN_PASSWORD=change-this-password
```

### 啟動

```bash
npm run dev
```

打開：

```txt
http://localhost:3000
```

---

## 8. Supabase 設定

到 Supabase SQL Editor 執行：

```txt
supabase/schema.sql
```

如果要匯入預設作品資料，可執行：

```txt
supabase/projects_seed.sql
```

新版後台也支援在 `/admin/projects` 直接把 mock projects 同步到 Supabase。

---

## 9. Chrome Extension 使用方式

### Build

```bash
npm run ext:build
```

### 安裝

1. 打開 `chrome://extensions/`
2. 開啟「開發人員模式」
3. 點「載入未封裝項目」
4. 選擇 `extension/` 資料夾

### 設定

本機：

```txt
Webhook URL: http://localhost:3000/api/webhook
Secret:      dev-secret
```

正式站：

```txt
Webhook URL: https://vibe-leetcode.vercel.app/api/webhook
Secret:      與 WEBHOOK_SECRET 相同
```

---

## 10. n8n workflow

n8n workflow 目前放在：

```txt
automation/n8n/workflow_leetcode_tracker.json
```

它屬於自動化與編排資料，因此不放在 `src/` 或 `docs/`。

---

## 11. 部署到 Vercel

Vercel Environment Variables 需要：

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
WEBHOOK_SECRET
NEXT_PUBLIC_USE_MOCK=false
ADMIN_PASSWORD
```

注意：

- `SUPABASE_SERVICE_ROLE_KEY` 不能寫進程式碼。
- 修改 env 後要重新部署。
- GitHub repo slug 建議使用 `kennys-hub`，網站顯示名稱才用 `Kenny's Hub`。

---

## 12. 開發檢查

每次提交前建議跑：

```bash
npm run lint
npm run build
```

如果改了 extension：

```bash
npm run ext:build
```

---

## 13. Code Review 路線

推薦順序：

1. `README.md`
2. `docs/Architecture.md`
3. `src/app/page.tsx`
4. `src/components/portfolio/project-card.tsx`
5. `src/app/admin/projects/page.tsx`
6. `src/actions/projects.ts`
7. `src/app/api/webhook/route.ts`
8. `supabase/schema.sql`

Review 時問：

- 這段 code 是 UI、server 邏輯，還是資料庫設定？
- 有沒有把 secret key 放到前端？
- 寫入資料前有沒有驗證權限？
- 改 schema 時 TypeScript type 有沒有同步？
- 改 UI 時手機版是否仍然可用？
