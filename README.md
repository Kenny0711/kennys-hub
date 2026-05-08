# LeetCode Learning Tracker

個人 LeetCode 刷題追蹤系統。Chrome Extension 自動擷取解題記錄 → 寫入 Supabase → Next.js Dashboard 展示題庫、解法、複習進度。

**線上版本：** https://vibe-leetcode.vercel.app

---

## 架構

```
LeetCode 頁面
  │  Chrome Extension 擷取（手動 or 自動偵測 Accepted）
  ▼
Next.js API（Vercel / localhost）
  │  驗證 secret → 清洗資料 → Upsert
  ▼
Supabase（PostgreSQL）
  │  Supabase Client 讀取
  ▼
Next.js Dashboard（統計 / 題庫 / 詳情）
```

---

## 功能

### Dashboard
- 總題數、Easy / Medium / Hard 分佈
- 365 天刷題熱力圖
- Top Tags 圓餅圖

### 題庫列表
- 搜尋、難度篩選、熟練度篩選、Tag 篩選
- 每題顯示難度、熟練度、Tags

### 題目詳情
- 多解法 Tab（解法名稱可自訂）
- 程式碼語法高亮 + 一鍵複製
- Time / Space 複雜度標籤（空白時顯示 `O(?)` 提示）
- Markdown 筆記（支援預覽）
- 可刪除單一解法（兩步確認）
- 題目描述折疊面板（點「載入描述」從 LeetCode 抓取）
- 熟練度循環切換（生疏 → 理解 → 熟練）並寫回 Supabase
- 複習提醒（根據熟練度顯示距離上次練習天數）
- 刪除題目（兩步確認）

### Chrome Extension
- **手動擷取**：在 LeetCode 題目頁點擊按鈕，擷取當前程式碼並送出
- **自動同步**：偵測 LeetCode Submit → Accepted 後自動送出（背景執行不中斷）
- **批量匯入歷史解題**：一鍵匯入所有 AC 題目，跳過已存在的題目
- **批量補全 Tags**：為所有題目補全官方 Tags
- 支援 Webhook URL 與 Secret 設定，關閉 Popup 也不中斷匯入

---

## 本機啟動

### 1. 安裝套件

```bash
npm install
```

### 2. 建立 `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
WEBHOOK_SECRET=dev-secret
NEXT_PUBLIC_USE_MOCK=false
```

### 3. 建立 Supabase 資料表

在 Supabase SQL Editor 執行 `supabase/schema.sql`，或直接貼上以下 SQL：

```sql
create table public.leetcode_records (
  id           uuid primary key default gen_random_uuid(),
  problem_id   integer not null,
  title        text not null,
  difficulty   text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  tags         text[] not null default '{}',
  proficiency  text not null default '理解' check (proficiency in ('生疏', '理解', '熟練')),
  solutions    jsonb not null default '[]'::jsonb,
  description  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.leetcode_records add constraint uq_problem_id unique (problem_id);
alter table public.leetcode_records disable row level security;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

create trigger trg_leetcode_records_updated_at
  before update on public.leetcode_records
  for each row execute function public.set_updated_at();
```

> 若資料表已建立但缺少 `description` 欄位，額外執行：
> ```sql
> ALTER TABLE public.leetcode_records ADD COLUMN IF NOT EXISTS description text;
> ```

### 4. 啟動

```bash
npm run dev
```

打開 http://localhost:3000

---

## 部署到 Vercel

1. 推送程式碼到 GitHub
2. 前往 [vercel.com](https://vercel.com)，Import 你的 repo
3. 在 **Environments** 填入以下四個環境變數：

| 變數名稱 | 說明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `WEBHOOK_SECRET` | 與 Extension 的 Secret 一致 |
| `NEXT_PUBLIC_USE_MOCK` | `false` |

4. Deploy，完成後將 Extension 的 Webhook URL 改為 Vercel 網址

---

## Chrome Extension 安裝

### Build

```bash
cd extension
node build.js
```

或從專案根目錄：

```bash
npm run ext:build
```

### 載入

1. 打開 `chrome://extensions/`
2. 開啟右上角「開發人員模式」
3. 點「載入未封裝項目」→ 選 `extension/` 資料夾

### 設定

Extension Popup 填入：

```
Webhook URL: https://vibe-leetcode.vercel.app/api/webhook
             （本機開發用 http://localhost:3000/api/webhook）
Secret:      dev-secret（與 WEBHOOK_SECRET 一致）
```

---

## 使用流程

### 自動同步（推薦）
在 LeetCode 題目頁提交程式碼 → 判定 Accepted → Extension 自動擷取並送出 → Dashboard 更新

### 手動擷取
在 LeetCode 題目頁，打開 Extension Popup → 點「擷取並送出」

### 批量匯入歷史解題
1. 前往任意 LeetCode 頁面
2. 打開 Extension Popup → 點「📥 匯入 LeetCode 歷史解題」
3. 等待進度條完成（可關閉 Popup，背景繼續執行）

### 補全 Tags
1. 前往任意 LeetCode 頁面
2. 打開 Extension Popup → 點「🏷️ 補全所有題目 Tags」

---

## 專案結構

```
vibe_leetcode/
├── extension/                  Chrome 擴充功能
│   ├── manifest.json
│   ├── popup.html
│   ├── build.js
│   └── src/
│       ├── main_world.ts       LeetCode submit/check 攔截
│       ├── content.ts          擷取題目資料、批量匯入、補全 Tags
│       ├── background.ts       代送 Webhook、批量匯入執行
│       └── popup.ts            Popup UI 邏輯
│
├── src/
│   ├── app/
│   │   ├── page.tsx                     Dashboard 首頁
│   │   ├── problems/
│   │   │   ├── page.tsx                 題庫列表
│   │   │   └── [id]/page.tsx            題目詳情
│   │   └── api/
│   │       ├── webhook/route.ts         接收 Extension 資料並寫入 Supabase
│   │       └── fetch-description/route.ts  從 LeetCode 抓取題目描述
│   ├── components/
│   │   ├── dashboard/                   統計卡片、熱力圖、Tag 圓餅圖
│   │   ├── problems/                    題庫列表、篩選列
│   │   └── detail/                      題目資訊面板、解法 Tabs
│   └── lib/
│       ├── supabase/                    Supabase Client（client / server）
│       ├── types.ts                     共用型別
│       └── utils.ts
│
└── supabase/
    └── schema.sql              建表 SQL
```

---

## 常用指令

| 指令 | 說明 |
|---|---|
| `npm run dev` | 啟動本機開發伺服器 |
| `npm run build` | 檢查 Next.js build |
| `npm run lint` | 檢查程式碼 |
| `node extension/build.js` | Build Chrome Extension |

---

## 除錯

| 問題 | 去哪裡看 |
|---|---|
| Dashboard 顯示不對 | 瀏覽器 Console（localhost:3000） |
| LeetCode Accepted 沒同步 | LeetCode 題目頁 Console，搜尋 `LC Tracker` |
| Webhook 寫入失敗 | Console 裡的 `[LC Tracker] Sync failed`，通常是 401 或 500 |
| Extension 完全沒反應 | `chrome://extensions/` 重新整理 extension，再重新整理 LeetCode 頁面 |
| Vercel 沒顯示資料 | Vercel → Environments 確認四個環境變數都有填，Redeploy 後再試 |
