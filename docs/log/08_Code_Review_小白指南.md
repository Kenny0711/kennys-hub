# 08 Code Review 小白指南

這份筆記的目標：讓你即使還不熟 Next.js / Supabase / TypeScript，也能開始看懂這個專案在改什麼。

---

## 先建立一個觀念：程式碼分三種

### 1. UI code

負責「畫面長什麼樣」。

常見位置：

```txt
src/app/page.tsx
src/components/
```

你會看到：

- `className="..."`
- `<div>`
- `<Link>`
- `<ProjectCard />`
- Tailwind CSS 樣式

review 時問：

- 文字有沒有清楚？
- 手機版會不會擠在一起？
- button 點了會去哪？
- loading / error 狀態有沒有處理？

---

### 2. Server code

負責「資料怎麼來、權限怎麼驗證、資料怎麼寫入」。

常見位置：

```txt
src/actions/
src/app/api/
src/lib/
```

你會看到：

- `use server`
- `cookies()`
- `revalidatePath`
- `supabase.from(...).insert(...)`
- `supabase.from(...).update(...)`

review 時問：

- 寫入資料前有沒有驗證權限？
- 有沒有把 secret key 放在前端？
- 錯誤時會不會有清楚提示？
- 寫入後前台畫面會不會更新？

---

### 3. Database / config code

負責「資料表長什麼樣、環境變數怎麼設定」。

常見位置：

```txt
supabase/schema.sql
.env.local.example
middleware.ts
```

review 時問：

- 程式碼裡用到的欄位，資料表真的有嗎？
- TypeScript type 跟 SQL schema 有沒有一致？
- 新增 env var 後，README 有沒有寫？
- RLS / 權限設定是否合理？

---

## Review 一個功能的順序

用「作品集後台」當例子。

### Step 1：先找入口頁

後台路由是：

```txt
/admin/projects
```

對應檔案：

```txt
src/app/admin/projects/page.tsx
```

這個檔案現在是 Server Component，負責：

- 檢查 admin cookie。
- 從 Supabase 讀取 projects。
- 把資料交給 client component。

### Step 2：看互動元件

```txt
src/app/admin/projects/admin-projects-client.tsx
```

這個檔案負責：

- 顯示列表。
- 打開編輯視窗。
- 按 Featured 星星。
- 呼叫 Server Actions。

它不應該直接拿 Supabase 寫資料庫。

### Step 3：看真正寫資料的地方

```txt
src/actions/projects.ts
```

這裡才是真正寫 Supabase 的地方。

重點看：

```ts
await assertAdmin();
```

這代表任何寫入前都會先確認你已登入後台。

### Step 4：看資料庫 client

```txt
src/lib/supabase-admin.ts
```

這裡使用：

```txt
SUPABASE_SERVICE_ROLE_KEY
```

這把 key 很危險，不能放前端，所以它只能在 server 端用。

---

## 常見名詞白話解釋

### Client Component

會跑在瀏覽器裡的 React component。

特徵：

```ts
'use client';
```

適合做：

- 點擊按鈕
- 開關 Dialog
- 表單輸入
- loading 狀態

不適合做：

- 使用 service role key
- 直接處理高權限資料庫寫入

### Server Component

在 server 端跑的 component。

適合做：

- 讀資料
- 驗證 cookie
- 準備畫面初始資料

### Server Action

Next.js 裡的一種 server 端函式。

特徵：

```ts
'use server';
```

適合做：

- 新增資料
- 更新資料
- 刪除資料
- 寫完後 `revalidatePath`

### RLS

Row Level Security，Supabase 的資料庫權限機制。

白話：資料庫會檢查「這個人有沒有資格看或改這一列資料」。

本專案的作品管理後台改成 Server Actions 後，可以讓 `projects` 表保持 RLS 開啟，因為真正寫入的是 server 端的 service role key。

---

## Review 前必跑指令

```bash
npm run lint
npm run build
```

如果你改了 Chrome Extension：

```bash
npm run ext:build
```

---

## 看到錯誤時怎麼辦

先不要慌，照這個順序查：

1. 錯誤訊息第一行是什麼？
2. 它指到哪個檔案？
3. 是前端錯、server 錯，還是 Supabase 錯？
4. 最近有沒有改 env var？
5. 最近有沒有改 schema？

例子：

```txt
new row violates row-level security policy
```

意思通常是：Supabase RLS 擋住寫入。  
新版架構下應該走 Server Action + service role key，如果還看到這個錯，通常是：

- `SUPABASE_SERVICE_ROLE_KEY` 沒設定。
- dev server 沒重啟。
- 寫入還是從前端 anon key 發出去。

---

## 一句話總結

Review 時不要只看「畫面有沒有動」。你要追蹤：

```txt
使用者點了什麼
  -> 呼叫哪個 component
  -> 呼叫哪個 action/API
  -> 寫到哪張資料表
  -> 前台怎麼重新更新
```
