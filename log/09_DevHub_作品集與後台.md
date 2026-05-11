# 09 DevHub 作品集與後台重構筆記

這份筆記記錄 Kenny's Hub 這次大重構做了什麼，以及未來 code review 時要怎麼看。

---

## 背景

一開始這個專案比較像 LeetCode Tracker：

- Chrome Extension 抓 LeetCode 解題。
- API 寫入 Supabase。
- Dashboard 顯示統計。

後來升級成個人研發門戶：

- 首頁要像作品集。
- LeetCode Dashboard 獨立成 `/dashboard`。
- 作品集要能從後台管理。
- 後台寫入要安全，不能把高權限金鑰放前端。

---

## 主要改動

### 1. 首頁變成個人門戶

主要檔案：

```txt
src/app/page.tsx
src/components/home/journey-timeline.tsx
src/components/portfolio/project-gallery.tsx
src/components/portfolio/project-card.tsx
```

首頁包含：

- Hero 自我介紹。
- 擅長語言標籤。
- 技術歷程時間軸。
- 精選作品集。

### 2. 作品集資料模型

主要檔案：

```txt
src/lib/types.ts
supabase/schema.sql
```

`Project` 的核心欄位：

- `title`
- `description`
- `project_url`
- `image_url`
- `tags`
- `is_featured`

首頁只顯示 `is_featured = true` 且最多三個作品。

### 3. 管理後台

主要檔案：

```txt
src/app/login/page.tsx
src/app/admin/projects/page.tsx
src/app/admin/projects/admin-projects-client.tsx
middleware.ts
```

流程：

```txt
/login
  -> 輸入 ADMIN_PASSWORD
  -> 設定 admin_auth_token cookie
  -> /admin/projects
```

### 4. Server Actions + Service Role Key

主要檔案：

```txt
src/actions/projects.ts
src/lib/supabase-admin.ts
```

舊架構：

```txt
Client Component 直接 supabase.update()
```

新架構：

```txt
Client Component
  -> Server Action
  -> assertAdmin()
  -> getSupabaseAdmin()
  -> service role key 寫 Supabase
```

好處：

- service role key 不會出現在瀏覽器。
- 寫入前會檢查 admin cookie。
- `projects` 表可以維持 RLS 開啟。
- 寫完會 revalidate 首頁與作品頁。

---

## Review 重點

看後台時請追這條線：

```txt
按下儲存
  -> admin-projects-client.tsx
  -> src/actions/projects.ts
  -> assertAdmin()
  -> supabase-admin.ts
  -> public.projects
```

要確認：

- Client Component 沒有直接寫 Supabase。
- 每個 Server Action 都有驗證 admin。
- 寫完有 `revalidatePath('/')` 和 `revalidatePath('/projects')`。
- 錯誤訊息能讓人知道要檢查 env、schema 或權限。

---

## 這次學到什麼

- UI 互動和資料庫寫入要分開。
- middleware 不是唯一防線，Server Action 也要驗證。
- mock data 只能當預覽，不能假裝是正式資料庫 id。
- README 和 log 是未來 code review 的地圖。
