# Development Log Index

This folder records project decisions, fixes, and implementation notes for Kenny's Hub.

The goal is not only to remember what changed, but also to make future code review easier. When you forget why a file exists or why a feature was written in a certain way, start here.

## How To Read These Logs

1. Read `README.md` first to understand what the website does.
2. Read `docs/Architecture.md` when you want the system map: routes, database, auth, API, and deployment.
3. Read the numbered logs below when you want the story of how a feature was built or fixed.
4. For code review, compare the log entry with the files listed inside it.

## Current Logs

1. `00_架構總覽.md`
   - Original system overview for the LeetCode tracker.

2. `01_技術清單.md`
   - Main libraries, services, and project structure.

3. `02_Chrome_Extension.md`
   - Chrome Extension capture flow and background/content script notes.

4. `03_Supabase_資料庫.md`
   - Supabase schema and data model notes.

5. `04_API_與後端.md`
   - API routes and webhook behavior.

6. `05_前端_Dashboard.md`
   - Dashboard and problem detail frontend notes.

7. `06_雲端部署.md`
   - Deployment and environment setup.

8. `07_問題記錄.md`
   - Debugging history and recurring issues.

9. `08_Code_Review_小白指南.md`
   - Beginner-friendly code review checklist.

10. `09_DevHub_作品集與後台.md`
    - DevHub portfolio/admin expansion notes.

11. `10_首頁聯絡履歷與LeetCode同步.md`
    - Homepage contact/resume update and LeetCode solution sync improvements.

12. `11_Dashboard_Google_Target_And_Read_Client.md`
    - Dashboard Google target reveal behavior and Supabase read/write client split.

13. `12_Portfolio_Card_Layout_And_Copy.md`
    - Portfolio card bottom alignment, project copy cleanup, and Supabase description sync.

## Review Checklist

Before pushing meaningful changes:

- README reflects user-facing features.
- Relevant log entry exists in this folder.
- The log explains why the change exists, not only what file changed.
- `npm run lint` passes.
- `npm run build` passes.
- Chrome Extension changes run through `npm run ext:build` when extension files changed.
- Supabase schema or seed changes are mentioned when database-visible behavior changes.

