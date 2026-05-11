# log 目錄導讀

這個資料夾用來放學習紀錄、code review 筆記、問題排查紀錄。

如果你之後想複習這個專案，不要一開始就直接看所有程式碼。先從這幾份開始：

1. `08_Code_Review_小白指南.md`
   - 教你怎麼分辨 UI code、server code、database/config code。
   - 適合 review 前先讀。

2. `09_DevHub_作品集與後台.md`
   - 說明 Kenny's Hub 這次從 LeetCode Tracker 升級成個人研發門戶的重構。
   - 包含作品集、後台、Server Actions、Service Role Key。

3. `07_問題記錄.md`
   - 遇到錯誤時可以回來查。

舊的 `00` 到 `07` 是歷史紀錄，部分內容可能因早期編碼問題顯示不完整，但仍保留作為開發脈絡。

---

## 每次 code review 可以問的問題

- 這次改動是修 bug、加功能、改架構，還是美化 UI？
- 哪些檔案是入口？
- 哪些檔案會寫入資料庫？
- 有沒有新增環境變數？
- README 是否同步更新？
- 有沒有跑 `npm run lint` 和 `npm run build`？
