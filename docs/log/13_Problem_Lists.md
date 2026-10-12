# Problem Lists

The `/problems` page now separates the personal problem archive from `/problems/lists`. The list index follows [Ling Shen's study route](https://leetcode.cn/discuss/post/3141566/ru-he-ke-xue-shua-ti-by-endlesscheng-q3yd/) in topic order. The sliding-window list contains the previously curated sections through 2.4; each of the other 11 lists contains selected beginner sections, not the full original article. Each card links back to its source.

## Completion rules

- A problem is automatically checked only when a saved solution has an explicit `accepted` status or `Accepted` submission status. A record existing by itself is not enough.
- `src/data/problem-lists/verified-accepted.ts` keeps a snapshot of the 66 verified problem IDs returned by the public `/api/records` endpoint on 2026-10-12. It makes known checkmarks visible even if the read API is temporarily unavailable. Live records add newly verified IDs.
- Duplicate appearances of the same problem ID within a list share one completion state and count once.
- Browser-local progress lives under `leetcode-problem-list-progress`, separately from archive records. `excludedAccepted` preserves a manual uncheck, and Reset clears the list's local completed/review state without changing Supabase.
- The 104 archive records without an explicit Accepted status are not automatically checked. Legacy status data should be repaired at its source before being counted.

## Source and maintenance

- `src/data/problem-lists/starter-lists.ts` contains selected problem IDs and titles from the linked original lists.
- `src/data/problem-lists/starter-slugs.json` is the generated ID-to-slug map for direct LeetCode links. After changing starter IDs, run `node scripts/generate-starter-slugs.mjs` and inspect the generated diff.
- The slug generator uses public question metadata from [Zanger67/leetcode-question-data](https://github.com/Zanger67/leetcode-question-data). Missing IDs fail generation instead of producing broken links.
- Accepted snapshots are conservative; update them only after checking explicit solution statuses from the public records API.
