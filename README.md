# LeetCode Learning Tracker

個人 LeetCode 刷題學習追蹤器。自動擷取解題資料，搭配視覺化 Dashboard 追蹤學習進度。

## 架構概覽

```
Chrome Extension
      │  點擊擷取，DOM 解析題目資訊
      ▼
n8n Webhook
      │  驗證 → 清洗 → Upsert
      ▼
Supabase (PostgreSQL)
      │  即時讀取
      ▼
Next.js Dashboard
      │  統計 / 熱力圖 / 題庫 / 筆記
```

## 技術選型

| 層級 | 技術 |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| 樣式 | Tailwind CSS v4, shadcn/ui |
| 圖表 | Recharts |
| 資料庫 | Supabase (PostgreSQL) |
| 擴充功能 | Chrome Extension Manifest V3 |
| 自動化 | n8n |

## 專案結構

```
vibe_leetcode/
├── extension/          # Chrome 擴充功能
│   ├── manifest.json
│   ├── popup.html
│   └── src/
│       ├── popup.ts
│       └── content.ts
├── n8n/
│   └── workflow_leetcode_tracker.json  # n8n Workflow 設定參考
├── supabase/
│   └── schema.sql      # 建表 SQL
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # React 元件
│   ├── hooks/          # 自定義 Hooks
│   └── lib/            # 工具函式、型別、Supabase client
└── .env.local.example  # 環境變數範例
```

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.local.example` 為 `.env.local`，填入你的 Supabase 金鑰：

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
WEBHOOK_SECRET=your-random-secret
NEXT_PUBLIC_USE_MOCK=true   # 開發時用 Mock 資料，正式改為 false
```

### 3. 建立 Supabase Table

到 Supabase Dashboard → SQL Editor，執行 `supabase/schema.sql`。

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

---

## Chrome Extension 安裝

1. 執行 build：

```bash
npm run ext:build
```

2. Chrome → `chrome://extensions/` → 開啟開發人員模式
3. 「載入未封裝項目」→ 選擇 `extension/` 資料夾
4. 開啟任意 LeetCode 題目頁面，點擊擴充功能圖示 → 輸入 Webhook URL → 擷取

---

## n8n Workflow 設定

參考 `n8n/workflow_leetcode_tracker.json` 在 n8n 介面手動建立以下流程：

```
Webhook → Build Solution Object → Check Existing → [INSERT | UPDATE]
```

Chrome Extension 發送的 Payload 格式：

```json
{
  "problem_id": 1,
  "title": "Two Sum",
  "difficulty": "Easy",
  "tags": ["Array", "Hash Table"],
  "code": "def twoSum(...):\n    ...",
  "language": "python"
}
```

---

## 資料庫 Schema

```sql
leetcode_records (
  id           uuid PRIMARY KEY,
  problem_id   integer UNIQUE,
  title        text,
  difficulty   text,          -- 'Easy' | 'Medium' | 'Hard'
  tags         text[],
  proficiency  text,          -- '生疏' | '理解' | '熟練'
  solutions    jsonb,         -- [{ method, code, language, time_complexity, space_complexity, notes }]
  created_at   timestamptz,
  updated_at   timestamptz
)
```

---

## 開發進度

- [x] Phase 0：Next.js 骨架 + Mock Dashboard UI
- [ ] Phase 1：Supabase 資料庫連接
- [ ] Phase 2：Chrome Extension 擷取功能
- [ ] Phase 3：n8n Webhook 整合
- [ ] Phase 4：題目詳情頁 + Markdown 筆記編輯
