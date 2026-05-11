# Kenny's Hub

Kenny's Hub 是 Kenny 的個人研發門戶，用來整理作品集、LeetCode 訓練紀錄、研究專案與工程學習軌跡。

目前線上版本：

```txt
https://vibe-leetcode.vercel.app
```

> Repo / 本機資料夾已改名為 `kennys-hub`。Vercel 網址目前仍沿用舊專案網址，之後可再到 Vercel 後台改 domain。

---

## 這個網站在幹嘛

這個網站想解決一件事：

> 把 Kenny 的學習、刷題、研究、作品集放在同一個地方，未來面試、複習、code review 時可以快速回顧。

它不是單純的作品集，也不是單純的 LeetCode dashboard，而是一個個人研發紀錄中心。

---

## 主要功能

### 1. 個人首頁

首頁 `/` 會呈現：

- 自我介紹：「嗨，我是 Kenny」。
- 擅長語言：C++、C、C#、PyTorch、Next.js。
- GitHub 頭像。
- 技術歷程時間軸：
  - 元智大學 YZU
  - 兆勤科技 Zyxel
  - 陽明交通大學 NYCU
- 精選作品集。

### 2. 作品集

作品集會展示 Kenny 的研究與工程專案。

目前包含：

- Deep Learning 課程專案。
- LeetCode Learning Tracker。
- 強化學習、Diffusion、VAE、DQN、SUMO 等專案。

頁面：

```txt
/projects
```

首頁只顯示被標記為 Featured 的前三個作品。

### 3. 作品管理後台

管理者可以登入後台，編輯作品集內容。

頁面：

```txt
/login
/admin/projects
```

可以做的事：

- 編輯作品名稱。
- 編輯作品描述。
- 編輯作品連結。
- 切換 Featured 星號，決定首頁顯示哪三個作品。
- 第一次使用時，把 mock projects 同步到 Supabase。

### 4. LeetCode Dashboard

LeetCode dashboard 用來追蹤刷題進度。

頁面：

```txt
/dashboard
/problems
/problems/[id]
```

功能包含：

- 題目總數統計。
- 難度分布。
- 熟練度追蹤。
- Activity heatmap。
- 題庫列表。
- 題目詳情與解法筆記。

### 5. Chrome Extension

Chrome Extension 可以在 LeetCode 題目頁擷取解題資料，送到網站的 webhook。

用途：

- Accepted 後自動同步。
- 手動擷取目前題目。
- 批量匯入歷史解題。
- 補全題目 tags。

---

## 常用入口

| 路由 | 說明 |
|---|---|
| `/` | 個人門戶首頁 |
| `/projects` | 全作品頁 |
| `/dashboard` | LeetCode 數據追蹤 |
| `/problems` | 題庫列表 |
| `/problems/[id]` | 題目詳情 |
| `/login` | 後台登入 |
| `/admin/projects` | 作品管理 |
| `/api/webhook` | Chrome Extension 寫入解題紀錄 |

---

## 文件分類

如果你只是想知道網站在做什麼，讀這份 README 就好。

如果你想知道架構、資料流、本機使用方式、部署方式，請讀：

```txt
docs/Architecture.md
```

如果你想做 code review 或回顧學習過程，請讀：

```txt
docs/log/README.md
docs/log/08_Code_Review_小白指南.md
docs/log/09_DevHub_作品集與後台.md
```
