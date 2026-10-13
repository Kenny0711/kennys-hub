# Problem Lists

The `/problems` page separates the personal problem archive from `/problems/lists`. The list index follows [Ling Shen's study route](https://leetcode.cn/discuss/post/3141566/ru-he-ke-xue-shua-ti-by-endlesscheng-q3yd/) in topic order. All 12 original topic lists and their chapters are now included, with 3,463 per-list distinct problems (2,824 unique IDs across topics) as of 2026-10-13. Each card links back to its source.

## Completion rules

- A problem is automatically checked for an explicit `accepted` solution, a legacy statusless solution with saved code, or a historical AC-import record. The old import fetched only LeetCode `status = "ac"` problems and saved them with blank code/status.
- `src/data/problem-lists/recorded-completions.ts` keeps a snapshot of 167 completed problem IDs from the public `/api/records` endpoint on 2026-10-12: 66 explicit Accepted, 13 statusless saved-code records, and 88 historical AC imports. This keeps their checkmarks visible if the read API is temporarily unavailable. Live records add new Accepted or statusless saved-code IDs.
- Duplicate appearances of the same problem ID within a list share one completion state and count once.
- Browser-local progress lives under `leetcode-problem-list-progress`, separately from archive records. `excludedAccepted` preserves a manual uncheck, and Reset clears the list's local completed/review state without changing Supabase.
- Three `unknown`-status problem records (#1752, #2379, #2461) are not inferred as solved; a later Accepted submission will check them. Failed submissions also do not count.

## Source and maintenance

- `src/data/problem-lists/full-lists.json` is the generated snapshot of the 12 source articles. It stores only chapter structure, problem IDs/titles, direct problem URLs, and available score/premium/optional markers; it does not copy explanations or code.
- Run `node scripts/sync-full-problem-lists.mjs --dry-run` to validate current sources, then `node scripts/sync-full-problem-lists.mjs` to refresh the snapshot. The script reads the original LeetCode articles through Jina's text proxy because direct requests from this environment receive HTTP 403. Use `--cache` to resume after rate limits; it saves temporary source copies outside the repository.
- The importer rejects unrecognized numbered problem links and unexpectedly short lists. Existing problem-list IDs and the browser storage key were retained, so saved checkmarks and review flags survive this data expansion.
- The list overview receives only IDs/titles for progress summaries. The detail view receives its selected list instead of bundling all 12 lists into each client page.
- Refresh the completion snapshot from the public records API after checking solution statuses and historical import provenance. Do not add `unknown` or failed submissions merely because code exists.
