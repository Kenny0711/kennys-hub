# 04 — API 與後端

## 什麼是 API？

API 就像是「點餐窗口」。

你（客人）不需要知道廚房裡怎麼做菜，你只需要把訂單遞進去，廚房做好了就把菜送出來。

在這個專案裡：
- 「客人」= Chrome Extension
- 「點餐窗口」= `/api/webhook`
- 「廚房」= API 程式碼
- 「菜」= 存進資料庫的結果

---

## 這個專案有哪些 API？

### 1. `POST /api/webhook`
**負責：** 接收 Extension 送來的解題資料，存進 Supabase

**檔案位置：** `src/app/api/webhook/route.ts`

**收到的資料（Request Body）：**
```json
{
  "problem_id": 1,
  "title": "Two Sum",
  "difficulty": "Easy",
  "tags": ["Array", "Hash Table"],
  "code": "def twoSum(self, nums, target):\n    ...",
  "language": "python",
  "lc_slug": "two-sum",
  "description": "<p>Given an array...</p>"
}
```

**處理流程：**
```
1. 檢查 x-webhook-secret header
   → 不對就回 401 Unauthorized（拒絕）

2. 解析 JSON Body
   → 格式錯誤就回 400 Bad Request

3. 清理程式碼
   → 去掉 ``` 程式碼區塊標記
   → 去掉特殊空白字元（&nbsp; 等）

4. 修正語言名稱
   → "C++" → "cpp"
   → "python3" → "python"

5. 查詢 Supabase：這題已經存在嗎？
   → 存在 + skip_if_exists=true → 跳過，回 "skipped"
   → 存在 + tags_only=true → 只更新 tags，回 "tags_updated"
   → 存在 → 加一筆新解法，回 "updated"
   → 不存在 → 建立新題目，回 "created"
```

---

### 2. `POST /api/fetch-description`
**負責：** 從 LeetCode 的公開 API 抓取題目描述，存回 Supabase

**檔案位置：** `src/app/api/fetch-description/route.ts`

**運作原理：**
LeetCode 有一個 GraphQL API（公開的），可以查詢題目的 HTML 描述。
這個 API 在伺服器端（Next.js API Route）呼叫，不受瀏覽器跨域限制。

```typescript
// 呼叫 LeetCode 的 GraphQL API
const res = await fetch('https://leetcode.com/graphql', {
  method: 'POST',
  body: JSON.stringify({
    query: `query { question(titleSlug: "two-sum") { content } }`
  })
});
```

---

### 3. `POST /api/visualize`（暫時停用）
**負責：** 呼叫 AI API，生成演算法視覺化步驟

目前因為 API Key 問題暫時停用，程式碼保留備用。

---

## 什麼是 HTTP 狀態碼？

API 回應時會帶一個數字，告訴你這次請求的結果：

| 狀態碼 | 意思 | 白話 |
|---|---|---|
| `200` | OK | 成功 |
| `201` | Created | 成功新建了一筆資料 |
| `400` | Bad Request | 你傳的資料有問題 |
| `401` | Unauthorized | 沒有權限（密碼不對） |
| `404` | Not Found | 找不到這個資源 |
| `429` | Too Many Requests | 請求太頻繁，被限速 |
| `500` | Internal Server Error | 伺服器內部錯誤 |

---

## 什麼是 Webhook？

一般的 API 是你「主動去問」：「有沒有新資料？」
Webhook 是對方「主動通知你」：「有新資料了！」

在這個專案裡：
- LeetCode 給出 Accepted 判定後
- Chrome Extension 主動 POST 到我們的 `/api/webhook`
- 這就是 Webhook 的概念：「有事情發生就通知我」

---

## 什麼是 Secret（密碼驗證）？

如果 Webhook URL 是公開的，任何人都可以亂傳假資料進來。

解法：在 Header 裡帶一個只有你自己知道的 Secret：

```
POST /api/webhook
Headers:
  x-webhook-secret: dev-secret   ← 這個
  Content-Type: application/json
```

API 收到後：
```typescript
const secret = req.headers.get('x-webhook-secret');
if (secret !== process.env.WEBHOOK_SECRET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

Extension 和 API 的 Secret 必須一致，才能通過驗證。

---

## 什麼是環境變數（Environment Variables）？

環境變數是「程式外部的設定值」，不寫在程式碼裡。

**為什麼不直接寫在程式碼裡？**

1. 安全性：Secret、API Key 不應該出現在 GitHub 上
2. 彈性：本機開發用 `localhost`，上線環境用 Vercel，只需要改環境變數，不用改程式碼

**本機用 `.env.local`：**
```env
WEBHOOK_SECRET=dev-secret
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
```

**Vercel 用「Environments」設定頁面**（效果一樣）

**在程式碼裡讀取：**
```typescript
process.env.WEBHOOK_SECRET          // 只在伺服器端可用
process.env.NEXT_PUBLIC_SUPABASE_URL // NEXT_PUBLIC_ 開頭的可以在瀏覽器端用
```

> **注意：** 只有 `NEXT_PUBLIC_` 開頭的變數才會傳到瀏覽器。其他變數只在伺服器上可用，更安全。
