# 03 — Supabase 資料庫

## 資料庫是什麼？

資料庫就是有組織的資料儲存空間。你可以把它想成 Excel 試算表：
- 一個「表（Table）」= 一個工作表
- 一「列（Row）」= 一筆資料
- 一「欄（Column）」= 一個欄位

這個專案只有一張表：`leetcode_records`，每一道題目是一列。

---

## Supabase 是什麼？

Supabase 是一個雲端資料庫服務，底層用的是 PostgreSQL（一種很流行的 SQL 資料庫）。

好處：
- 不用自己架資料庫伺服器
- 有免費方案（個人專案夠用）
- 自動產生 API，讓你用 JavaScript 讀寫資料
- 有管理介面，可以直接在瀏覽器裡看資料

---

## 資料表結構

```sql
create table public.leetcode_records (
  id           uuid,        -- 唯一 ID（自動產生）
  problem_id   integer,     -- LeetCode 題號，例如 1
  title        text,        -- 題目名稱，例如 "Two Sum"
  difficulty   text,        -- "Easy" / "Medium" / "Hard"
  tags         text[],      -- 標籤陣列，例如 ["Array", "Hash Table"]
  proficiency  text,        -- "生疏" / "理解" / "熟練"
  solutions    jsonb,       -- 解法陣列（JSON 格式）
  description  text,        -- 題目描述（HTML 格式）
  created_at   timestamptz, -- 建立時間
  updated_at   timestamptz  -- 最後更新時間
);
```

### 什麼是 jsonb？

`jsonb` 是 PostgreSQL 的一種欄位型別，可以存放 JSON 格式的資料。

`solutions` 欄位存的是一個陣列，每個解法長這樣：
```json
[
  {
    "method": "Hash Map",
    "code": "def twoSum(self, ...):\n    ...",
    "language": "python",
    "time_complexity": "O(n)",
    "space_complexity": "O(n)",
    "notes": "用 HashMap 存 target - current 的值..."
  }
]
```

一道題可以有多個解法，都存在這個陣列裡。

---

## 如何讀寫資料

### 讀取資料（Server Component 用）

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';

// 在 Next.js Server Component 或 API Route 裡使用
const supabase = await createClient();

// 讀取所有題目
const { data } = await supabase
  .from('leetcode_records')
  .select('*')
  .order('created_at', { ascending: false });
```

### 讀取資料（Client Component 用）

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

// 在 'use client' 元件裡使用
const supabase = createClient();

// 更新熟練度
await supabase
  .from('leetcode_records')
  .update({ proficiency: '熟練' })
  .eq('id', '某個-uuid');
```

### 重要：Server vs Client

這個專案把 Supabase Client 分成兩個版本：
- `server.ts`：在 Next.js 伺服器端（Server Component / API Route）使用
- `client.ts`：在瀏覽器端（Client Component，有 `'use client'` 的檔案）使用

**千萬不要在 Client Component 裡引入 server.ts！** 會造成 API Key 外洩。

---

## Row Level Security（RLS）是什麼？

RLS 是 Supabase 的安全機制，預設開啟時「所有請求都被擋掉」，除非你設定規則允許。

這個專案把 RLS **關掉**了（因為是個人用，不需要複雜的權限控管）：

```sql
alter table public.leetcode_records disable row level security;
```

如果你的 Supabase 查詢回傳空陣列，但確定資料庫有資料，**第一個要檢查的就是 RLS 有沒有被開啟**。

---

## Updated At 觸發器

這個 SQL 設定了一個「觸發器」：每次有 `UPDATE` 操作，`updated_at` 欄位就自動更新成現在時間。

```sql
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger trg_leetcode_records_updated_at
  before update on public.leetcode_records
  for each row execute function public.set_updated_at();
```

---

## 查看資料的方式

1. **Supabase Dashboard** → Table Editor → `leetcode_records`
   直接在瀏覽器裡看所有資料，可以新增、編輯、刪除

2. **SQL Editor** → 執行 SQL 查詢
   ```sql
   select problem_id, title, difficulty from leetcode_records order by problem_id;
   ```

3. **你的 Dashboard 網站**
   `https://vibe-leetcode.vercel.app/problems`

---

## 常見問題

### 為什麼題庫是空的？
可能原因：
1. 環境變數 `NEXT_PUBLIC_SUPABASE_URL` 或 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 填錯
2. RLS 被開啟（查詢被擋掉但不報錯，直接回空資料）
3. `NEXT_PUBLIC_USE_MOCK=true`（顯示假資料而不是真資料）

### 加了新欄位（例如 description）後，舊程式碼還能跑嗎？
可以。Supabase 新增欄位時加上 `IF NOT EXISTS` 就不會報錯，而且新欄位如果是 `nullable`（允許空值），舊資料不需要填就能繼續使用。
