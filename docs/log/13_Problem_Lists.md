# Problem Lists

The `/problems` page now separates the personal problem archive from `/problems/lists`. The list index follows [Ling Shen's study route](https://leetcode.cn/discuss/post/3141566/ru-he-ke-xue-shua-ti-by-endlesscheng-q3yd/) in topic order. The sliding-window list contains the previously curated sections through 2.4; each of the other 11 lists contains selected beginner sections, not the full original article. Each card links back to its source.

## Completion rules

- A problem is automatically checked for an explicit `accepted` solution, a legacy statusless solution with saved code, or a historical AC-import record. The old import fetched only LeetCode `status = "ac"` problems and saved them with blank code/status.
- `src/data/problem-lists/recorded-completions.ts` keeps a snapshot of 167 completed problem IDs from the public `/api/records` endpoint on 2026-10-12: 66 explicit Accepted, 13 statusless saved-code records, and 88 historical AC imports. This keeps their checkmarks visible if the read API is temporarily unavailable. Live records add new Accepted or statusless saved-code IDs.
- Duplicate appearances of the same problem ID within a list share one completion state and count once.
- Browser-local progress lives under `leetcode-problem-list-progress`, separately from archive records. `excludedAccepted` preserves a manual uncheck, and Reset clears the list's local completed/review state without changing Supabase.
- Three `unknown`-status problem records (#1752, #2379, #2461) are not inferred as solved; a later Accepted submission will check them. Failed submissions also do not count.

## Source and maintenance

- `src/data/problem-lists/starter-lists.ts` contains selected problem IDs and titles from the linked original lists.
- `src/data/problem-lists/starter-slugs.json` is the generated ID-to-slug map for direct LeetCode links. After changing starter IDs, run `node scripts/generate-starter-slugs.mjs` and inspect the generated diff.
- The slug generator uses public question metadata from [Zanger67/leetcode-question-data](https://github.com/Zanger67/leetcode-question-data). Missing IDs fail generation instead of producing broken links.
- Refresh the completion snapshot from the public records API after checking solution statuses and historical import provenance. Do not add `unknown` or failed submissions merely because code exists.
