# 02 — Chrome Extension 怎麼運作？

## Extension 是什麼？

Chrome Extension 是安裝在你瀏覽器裡的小程式。它可以：
- 讀取當前網頁的內容（例如抓取 LeetCode 上的程式碼）
- 在網頁上執行動作（例如自動點按鈕）
- 在背景持續運行（例如偵測 Submit 結果）
- 用小視窗（Popup）和你互動

---

## 這個 Extension 的四個檔案分別做什麼

### `manifest.json` — 設定檔
就像是這個 Extension 的「身分證」，告訴 Chrome：
- 這個 Extension 叫什麼名字
- 需要什麼權限（例如可以讀取哪些網站）
- 哪個檔案是 Popup、哪個是 Content Script、哪個是 Background

```json
{
  "name": "Kenny 的研發日誌",
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["https://leetcode.com/*"],
  "content_scripts": [{
    "matches": ["https://leetcode.com/*"],
    "js": ["dist/content.js"]
  }],
  "background": {
    "service_worker": "dist/background.js"
  }
}
```

**重點：** `host_permissions` 裡的 URL 決定了 Extension 能在哪些網站上執行。如果這裡沒有 `leetcode.com`，content script 就完全無法運作。

---

### `content.ts` — 住在 LeetCode 頁面的程式

這個檔案的程式碼「注入」到 LeetCode 網頁裡，可以直接讀取頁面上的 DOM（HTML 元素）。

**它做的事：**
1. 監聽 LeetCode 送出的訊號（「有 Accepted 了！」）
2. 用 CSS Selector 從頁面上抓取資料：
   - 題目名稱：`div.text-title-large`
   - 難度：`[class*="text-difficulty-easy"]`
   - Tags：透過 LeetCode GraphQL API 取得
   - 程式碼：Monaco Editor（LeetCode 用的編輯器）
3. 也負責「批量匯入」和「補全 Tags」的邏輯

**什麼是 DOM？**
DOM 就是網頁上所有的 HTML 元素。用 JavaScript 可以「選取」特定元素並讀取它的文字。

```javascript
// 例如：選取頁面上 class 為 "text-title-large" 的元素，讀取文字
const titleEl = document.querySelector('.text-title-large');
const title = titleEl.innerText; // "1. Two Sum"
```

---

### `background.ts` — 在背景默默工作的程式

Background Service Worker 是在瀏覽器背景持續運行的程式，**不依附在任何網頁上**。

**為什麼需要它？**

> 問題：content.ts 住在 LeetCode 頁面（`leetcode.com`），如果直接從那裡發送 HTTP 請求到 `localhost:3000`，瀏覽器的安全機制會擋掉（跨域請求限制）。

> 解法：content.ts 把資料「傳給」background.ts，讓 background 代替去送 HTTP 請求。Background 不住在任何網頁，所以不受這個限制。

**訊息傳遞示意：**
```
content.ts（LeetCode 頁面）
  → chrome.runtime.sendMessage({ type: 'WEBHOOK_SYNC', data: {...} })
  → background.ts 收到訊息
  → background.ts 發送 POST 到 webhook
```

---

### `popup.ts` — 你點開 Extension 看到的視窗

這是 Extension 右上角圖示點開後出現的視窗。

**功能：**
- 顯示你目前在不在 LeetCode 題目頁（偵測 URL）
- 讓你填入 Webhook URL 和 Secret
- 手動觸發「擷取並送出」
- 「批量匯入歷史解題」按鈕
- 「補全所有題目 Tags」按鈕
- 顯示匯入進度條

**進度條的原理：**
匯入是在 background.ts 裡跑，Popup 不知道進度。解法是用 `chrome.storage.local` 當作「共享黑板」：
- background 每處理一題，就把進度寫進 `chrome.storage.local`
- popup 每 400ms 讀一次這個進度，更新進度條
- 就算 Popup 關掉再開，也能恢復進度顯示

---

## Build 流程

TypeScript 不能直接在瀏覽器跑，需要先「編譯」成 JavaScript。

**`extension/build.js` 做的事：**
1. 用 `esbuild` 把四個 `.ts` 檔案各別編譯成 `.js`
2. 輸出到 `extension/dist/` 資料夾
3. Chrome 讀的就是 `dist/` 裡的檔案

```
TypeScript 原始碼           編譯後的 JavaScript
extension/src/
  content.ts      →  esbuild  →  extension/dist/content.js
  background.ts   →  esbuild  →  extension/dist/background.js
  popup.ts        →  esbuild  →  extension/dist/popup.js
  main_world.ts   →  esbuild  →  extension/dist/main_world.js
```

**所以改了程式碼後，必須：**
1. `node extension/build.js` 重新編譯
2. 在 `chrome://extensions/` 點「重新整理」Extension
3. 重新整理 LeetCode 頁面

---

## 批量匯入的完整流程

```
使用者點「📥 匯入 LeetCode 歷史解題」
        │
        ▼
popup.ts 傳訊息給 content.ts：「幫我拿所有 AC 題目」
        │
        ▼
content.ts 呼叫 LeetCode API：
  GET /api/problems/all/
  （回傳所有題目，篩選 status = "ac"）
        │
        ▼
拿到題目清單後，傳給 popup.ts
        │
        ▼
popup.ts 傳訊息給 background.ts：「幫我批量匯入這些題目」
        │
        ▼
background.ts 一題一題 POST 到 webhook
  帶上 skip_if_exists: true（如果已存在就跳過）
  每題間隔 80ms（不要打太快）
        │
        ▼
每 POST 完一題，更新 chrome.storage.local 的進度
        │
        ▼
popup.ts 每 400ms 讀一次進度，更新進度條顯示
```

---

## 常見問題

### Extension 完全沒反應？
1. 確認 `chrome://extensions/` 裡 Kenny 的研發日誌 有開啟
2. 確認有重新 build（`node extension/build.js`）
3. 確認有按「重新整理」Extension
4. 重新整理 LeetCode 頁面
5. 打開 Console（F12），看有沒有 `[Kenny 的研發日誌]` 開頭的 log

### Console 有 `[Kenny 的研發日誌] content script loaded` 但沒同步？
- 確認 Webhook URL 填的是正確的（Vercel 網址或 localhost）
- 確認 Secret 和 `WEBHOOK_SECRET` 環境變數一致
