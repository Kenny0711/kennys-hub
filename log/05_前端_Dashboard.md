# 05 — 前端 Dashboard

## 前端是什麼？

前端就是「你用眼睛看到的部分」——網頁上的按鈕、表格、圖表、動畫都是前端。

後端是「看不到但在背後工作的部分」——API、資料庫讀寫。

---

## Next.js 的頁面怎麼運作？

這個專案用的是 Next.js **App Router**（比較新的方式）。

**資料夾結構決定 URL：**
```
src/app/
  page.tsx              → 對應 /（首頁）
  problems/
    page.tsx            → 對應 /problems（題庫列表）
    [id]/
      page.tsx          → 對應 /problems/某個id（題目詳情）
  api/
    webhook/
      route.ts          → 對應 /api/webhook（API，不是頁面）
```

`[id]` 是動態路由，代表可以是任何值。`/problems/abc123` 和 `/problems/xyz456` 都會對應到同一個 `page.tsx`，但 `id` 的值不同。

---

## Server Component vs Client Component

Next.js 有兩種元件，這是最重要的概念之一：

### Server Component（預設）
- 程式碼在**伺服器**上執行
- 可以直接讀取資料庫（安全）
- 不能用 `useState`、`useEffect`（因為不在瀏覽器上跑）
- 不能有「互動」（點擊、輸入）

```tsx
// 這是 Server Component（沒有 'use client'）
// src/app/problems/[id]/page.tsx

export default async function ProblemDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient(); // 可以直接用 server client
  const { data: record } = await supabase
    .from('leetcode_records')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  return <div>{record.title}</div>; // 畫面
}
```

### Client Component（加了 `'use client'`）
- 程式碼在**瀏覽器**上執行
- 可以用 `useState`、`useEffect`（處理互動）
- 不能直接讀取資料庫（要用 browser client）

```tsx
'use client'; // 這行宣告這是 Client Component

import { useState } from 'react';

export default function ProficiencyButton({ proficiency }) {
  const [current, setCurrent] = useState(proficiency);
  
  return (
    <button onClick={() => setCurrent('熟練')}>
      {current}
    </button>
  );
}
```

**原則：能用 Server Component 就用 Server Component，只有需要互動時才用 Client Component。**

---

## 各頁面的架構

### Dashboard 首頁（`src/app/page.tsx`）

```
Dashboard 首頁
├── StatsCards（統計卡片）
│     總題數 / Easy / Medium / Hard 數量
│     Server Component（直接讀 Supabase）
│
├── ActivityHeatmap（熱力圖）
│     365 天的刷題頻率
│     Client Component（用 CSS Grid 畫）
│
└── TagPieChart（Tags 圓餅圖）
      Top 8 最常出現的 Tags
      Client Component（用 Recharts 畫）
```

### 題庫列表（`src/app/problems/page.tsx`）

```
題庫頁
└── FilterBar（篩選列）
│     難度 / 熟練度 / Tag / 搜尋
│     Client Component
│
└── ProblemTable（題目表格）
      列出所有題目
      Client Component（有篩選互動）
```

### 題目詳情（`src/app/problems/[id]/page.tsx`）

```
詳情頁（Server Component，讀取 Supabase）
├── ProblemInfoPanel（左側資訊面板）
│     題號、名稱、難度、Tags
│     熟練度按鈕（點擊更新 Supabase）
│     刪除題目按鈕（兩步確認）
│     題目描述折疊面板
│     Client Component
│
└── SolutionTabs（右側解法 Tabs）
      每個解法一個 Tab
      複雜度標籤（空白時顯示 O(?)）
      程式碼區塊 + 複製按鈕
      Markdown 筆記
      刪除解法按鈕（兩步確認）
      Client Component
```

---

## 常用的 React Hooks

### `useState` — 儲存畫面的狀態

```typescript
const [count, setCount] = useState(0);
// count 是當前值，setCount 是更新函式
// 呼叫 setCount(1) 後，count 變成 1，畫面重新渲染
```

### `useEffect` — 在特定時機執行程式

```typescript
useEffect(() => {
  // 這裡的程式碼在元件「出現在畫面上」時執行
  fetchData();
}, []); // [] 表示只執行一次
```

### `useRouter` — 跳轉頁面

```typescript
const router = useRouter();
router.push('/problems'); // 跳到 /problems 頁面
router.refresh();         // 重新整理當前頁面的資料
```

---

## 畫面上的樣式怎麼寫

這個專案用 **Tailwind CSS**，直接在 className 裡寫樣式：

```tsx
<div className="
  rounded-xl          /* 圓角 */
  border              /* 邊框 */
  border-white/8      /* 白色邊框，8% 透明度 */
  bg-white/[0.015]    /* 白色背景，1.5% 透明度（很淡的毛玻璃效果） */
  p-5                 /* padding: 20px */
  space-y-4           /* 子元素間距 16px */
">
```

**Tailwind 的顏色系統：**
- `text-emerald-400` = 翠綠色文字
- `bg-rose-500/10` = 玫瑰紅背景，10% 不透明度
- `border-sky-500/20` = 天藍色邊框，20% 不透明度

---

## 這個專案的深色主題

整個 Dashboard 是深色主題（黑底白字）。  
背景色是 `#0f0f0f`（非常深的黑色），定義在 `src/app/globals.css`。

UI 元件用大量的 `white/5`、`white/8` 等半透明白色製造層次感，避免純色太死板。
