# LeetCode Learning Tracker

這是一個個人用的 LeetCode 學習追蹤器。

它做的事情很單純：你在 LeetCode 寫題、送出答案，當結果是 `Accepted` 時，Chrome Extension 會自動把題目、難度、tags、程式碼和語言送到本機網站，網站再把資料存進 Supabase，最後你可以在 Dashboard 裡看自己的題庫、解法和複習狀態。

如果你完全不熟網頁開發，可以先把它想成四個角色：

```text
LeetCode 頁面
  -> Chrome Extension 負責擷取資料
  -> Next.js API 負責接收資料
  -> Supabase 負責存資料
  -> Dashboard 負責顯示資料
```

## 我這次做了什麼

這次主要完成的是「按 LeetCode Submit 之後，自動同步到網站」。

以前你必須手動按 Chrome Extension 的擷取按鈕，資料才會進網站。現在流程改成：

```text
你在 LeetCode 按 Submit
  -> Extension 偵測到這次提交
  -> Extension 等 LeetCode 判題結果
  -> 如果結果是 Accepted
  -> Extension 自動擷取題目資料和程式碼
  -> 送到 http://localhost:3000/api/webhook
  -> Webhook 寫入 Supabase
  -> Dashboard 題庫更新
```

這次也一起修了這些問題：

- Dashboard 的題數改成讀 Supabase，不再用假的固定數字。
- 題庫頁重新顯示 tags。
- 題目詳情頁的程式碼顯示修好，不再把 C++ 當成 Python 顯示。
- 移除奇怪的 `Initial Capture` 標籤。
- README 改成適合初學者閱讀的學習版。
- Extension 自動同步改成 background service worker 代送 webhook，避免 LeetCode 頁面直接打 `localhost` 被瀏覽器擋住。
- Webhook 不再強制寫入 `lc_slug` 欄位，避免 Supabase table 還沒更新時爆掉。

## 目前可以使用的功能

- Dashboard 查看目前刷題進度。
- 題庫頁搜尋題目、看難度、看 tags、看熟練度。
- 題目詳情頁查看每題的解法程式碼。
- Chrome Extension 手動擷取 LeetCode 題目。
- LeetCode `Submit` 後，如果結果是 `Accepted`，自動同步到網站。
- 自動抓 LeetCode 官方 tags。
- 自動清理程式碼裡的 code fence、特殊空白和錯誤語言標籤。

## 怎麼啟動網站

先安裝套件：

```bash
npm install
```

建立 `.env.local`：

```bash
cp .env.local.example .env.local
```

`.env.local` 至少要有：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
WEBHOOK_SECRET=dev-secret
NEXT_PUBLIC_USE_MOCK=false
```

啟動本機網站：

```bash
npm run dev
```

打開：

[http://localhost:3000](http://localhost:3000)

## 怎麼安裝 Chrome Extension

每次改 extension 程式碼後，都要重新 build：

```bash
npm run ext:build
```

然後到 Chrome：

1. 打開 `chrome://extensions/`
2. 開啟右上角「開發人員模式」
3. 按「載入未封裝項目」
4. 選這個專案裡的 `extension/` 資料夾
5. 如果之後有改 extension，記得在這一頁按重新整理

Extension popup 裡要填：

```text
Webhook URL: http://localhost:3000/api/webhook
Secret: dev-secret
```

`Secret` 要跟 `.env.local` 裡的 `WEBHOOK_SECRET` 一樣。

## 你該怎麼一步一步學 code review

你現在不用一開始就懂 React、Next.js、Chrome Extension、Supabase。你可以照下面順序讀，每一步只問一組問題。

### 第 1 步：先看資料怎麼流動

先看這些檔案：

```text
extension/src/main_world.ts
extension/src/content.ts
extension/src/background.ts
src/app/api/webhook/route.ts
```

你要問：

- 資料是從哪裡來的？
- 哪一段程式偵測 LeetCode Submit？
- 哪一段程式判斷 Accepted？
- 哪一段程式把資料送到網站？
- 哪一段程式把資料寫入 Supabase？

這一步的目標不是看懂每一行，而是先知道「每個檔案負責什麼」。

### 第 2 步：看 Extension 怎麼偵測 LeetCode

先看：

```text
extension/src/main_world.ts
```

這支檔案跑在 LeetCode 頁面的 MAIN world。它做兩件事：

- 攔截 LeetCode 的 submit request。
- 攔截 LeetCode 的 submission check request。

你在 Console 看到的這些 log 就是它印的：

```text
[LC Tracker] submit request intercepted
[LC Tracker] submission check intercepted
[LC Tracker] Submission status: Accepted
```

Code review 時你要問：

- 它有沒有只在 LeetCode 頁面上跑？
- 它有沒有正確抓到 submit URL？
- 它有沒有正確抓到 check URL？
- 如果 LeetCode 改版，這裡會不會壞？

### 第 3 步：看資料怎麼被整理

再看：

```text
extension/src/content.ts
```

這支檔案負責把 LeetCode 頁面上的資料整理成乾淨格式。

它會整理：

- 題號，例如 `1`
- 題目名稱，例如 `Two Sum`
- 難度，例如 `Easy`
- tags，例如 `Array`、`Hash Table`
- 程式碼
- 語言，例如 `cpp`

Code review 時你要問：

- 如果 LeetCode 頁面抓不到 title，會不會有 fallback？
- 如果 tags 沒出現在畫面上，有沒有用 GraphQL 補抓？
- 如果語言顯示 C++，最後有沒有存成 `cpp`？
- 如果程式碼裡有奇怪空白，有沒有清掉？

### 第 4 步：看為什麼要有 background

再看：

```text
extension/src/background.ts
```

我們一開始讓 `content.ts` 直接送資料到：

```text
http://localhost:3000/api/webhook
```

結果 Chrome Console 出現：

```text
[LC Tracker] Sync failed: TypeError: Failed to fetch
```

這代表 LeetCode 頁面直接打本機 webhook 時，被瀏覽器限制擋住了。

所以修法是：讓 content script 只負責「我抓到資料了」，真正 POST webhook 的事情交給 Chrome Extension 的 background service worker。

Code review 時你要問：

- content script 有沒有把資料交給 background？
- background 有沒有帶上 `x-webhook-secret`？
- background 有沒有把錯誤訊息回傳給 content script？
- webhook 失敗時，Console 能不能看懂原因？

### 第 5 步：看 API 怎麼寫入資料庫

再看：

```text
src/app/api/webhook/route.ts
```

這支檔案是網站的 API。Extension 送資料過來後，這裡會：

1. 檢查 secret 對不對。
2. 解析 JSON。
3. 清理 code fence 和特殊空白。
4. 修正語言名稱。
5. 查 Supabase 裡有沒有這題。
6. 如果已經有，就把新解法加進去。
7. 如果沒有，就建立新題目。

Code review 時你要問：

- 沒有 secret 或 secret 錯誤時，有沒有拒絕？
- JSON 格式錯誤時，有沒有回 400？
- Supabase 寫入失敗時，有沒有把錯誤回傳？
- 同一題再次 Accepted，是新增 solution，還是蓋掉舊資料？
- API 有沒有寫入資料庫不存在的欄位？

### 第 6 步：看 Dashboard 怎麼顯示資料

最後看：

```text
src/app/page.tsx
src/app/problems/page.tsx
src/app/problems/[id]/page.tsx
src/hooks/use-records.ts
```

這些檔案負責把 Supabase 裡的資料顯示出來。

Code review 時你要問：

- Dashboard 的總題數是不是來自 Supabase？
- 題庫列表是不是用真資料？
- tags 有沒有顯示？
- 題目詳情頁的程式碼語法有沒有用正確語言？
- 空資料時畫面會不會壞掉？

## 這次遇到的問題和解決方式

### 問題 1：Dashboard 題數不對

現象：

```text
題庫只有 3 題，但 Dashboard 顯示 12 題
```

原因：

Dashboard 原本用 mock data 或固定數字，不是從 Supabase 算出來。

解法：

改成 Dashboard 讀 Supabase 的 `leetcode_records`，用真正資料計算總題數、難度和統計。

### 問題 2：LeetCode Submit 後沒有自動同步

現象：

你按 LeetCode Submit，但網站沒有新增 Two Sum。

原因：

一開始 extension 沒有正確注入 LeetCode 頁面，所以 Console 裡只有 LeetHub 的 log，沒有 `LC Tracker` 的 log。

解法：

把 extension 的 content script match 範圍改成：

```text
https://leetcode.com/*
```

並加上 debug log：

```text
[LC Tracker] main world loaded
[LC Tracker] content script loaded
```

這樣一打開 LeetCode Console 就知道 extension 有沒有真的載入。

### 問題 3：Accepted 有抓到，但同步失敗

現象：

Console 出現：

```text
[LC Tracker] Submission status: Accepted
[LC Tracker] Sync failed: TypeError: Failed to fetch
```

原因：

content script 從 LeetCode 頁面直接打 `localhost`，被瀏覽器限制擋住。

解法：

新增：

```text
extension/src/background.ts
```

讓 background service worker 代替 LeetCode 頁面去 POST webhook。

### 問題 4：Webhook 500，說找不到 `lc_slug`

現象：

Console 出現：

```text
Webhook failed (500): Could not find the 'lc_slug' column
```

原因：

程式想寫入 `lc_slug`，但實際 Supabase table 還沒有這個欄位。

解法：

Webhook 接收 payload 裡的 `lc_slug`，但不強制寫入資料庫。這樣你的舊 schema 也可以正常運作。

### 問題 5：程式碼顯示語法錯誤

現象：

C++ 程式碼被顯示成 Python，甚至 code block 排版跑掉。

原因：

資料裡的 language 欄位不乾淨，code fence 和語言標籤也沒有被整理好。

解法：

- 清掉 code fence。
- 把 `C++` 統一存成 `cpp`。
- 題目詳情頁用乾淨的 `<pre><code>` 顯示程式碼。

## 以後 code review 可以照這個 checklist

每次改功能前後，你可以照這個順序檢查：

1. 這個功能的資料從哪裡來？
2. 資料中間經過哪些檔案？
3. 每個檔案的責任是不是單純？
4. 有沒有錯誤處理？
5. Console log 能不能幫你定位問題？
6. API 有沒有驗證 secret？
7. 寫入 Supabase 的欄位，資料庫真的有嗎？
8. 前端空資料時會不會壞掉？
9. 手動流程和自動流程是不是都能用？
10. 改 extension 後，有沒有重新 build 並 reload？

## 常用指令

啟動網站：

```bash
npm run dev
```

檢查程式碼格式和 lint：

```bash
npm run lint
```

檢查 Next.js build：

```bash
npm run build
```

重新 build Chrome Extension：

```bash
npm run ext:build
```

## 看錯誤時該去哪裡

如果是 Dashboard 顯示不對：

```text
看 http://localhost:3000 的頁面 Console
```

如果是 LeetCode Submit 沒同步：

```text
看 LeetCode 題目頁的 Console
Filter 輸入 LC Tracker
```

如果是 webhook 寫入失敗：

```text
看 LeetCode Console 裡的 [LC Tracker] Sync failed
錯誤內容通常會告訴你是 401、500，或資料庫欄位問題
```

如果完全沒有 `LC Tracker` log：

```text
去 chrome://extensions/
重新整理 LC Tracker extension
再重新整理 LeetCode 頁面
```

## 專案結構

```text
vibe-leetcode/
  extension/
    manifest.json
    popup.html
    build.js
    src/
      main_world.ts      LeetCode submit/check 攔截
      content.ts         擷取題目資料，等待 Accepted
      background.ts      代送 webhook
      popup.ts           手動擷取按鈕

  src/
    app/
      api/webhook/route.ts     接收 Extension 資料並寫入 Supabase
      page.tsx                 Dashboard
      problems/page.tsx        題庫列表
      problems/[id]/page.tsx   題目詳情
    components/                UI 元件
    hooks/                     共用資料讀取邏輯
    lib/                       Supabase client 和型別

  supabase/
    schema.sql                 建立資料表的 SQL

  n8n/
    workflow_leetcode_tracker.json
```

## 目前狀態

- Dashboard 已改成讀 Supabase 真資料。
- 題庫 tags 已恢復顯示。
- 題目詳情頁程式碼顯示已修正。
- 手動擷取可以用。
- LeetCode Accepted 後自動同步可以用。
- Webhook 已相容沒有 `lc_slug` 欄位的資料庫。
- README 已改成學習導向版本。
