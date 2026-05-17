# 10 首頁聯絡履歷與 LeetCode 同步

Date: 2026-05-17

## Summary

This update publishes the latest Kenny's Hub homepage and LeetCode tracker improvements.

The homepage now makes contact information more visible and adds a resume preview flow. The LeetCode Extension and detail page also gained safer automatic syncing so a newly accepted BFS/DFS solution can appear on the website without manual capture.

---

## Homepage Contact Area

Updated file:

```txt
src/app/page.tsx
```

Changes:

- Added Gmail contact link: `kenny103089@gmail.com`
- Added GitHub contact link: `https://github.com/Kenny0711`
- Moved the contact links into the main homepage action row
- Renamed the dashboard action from `進入 Dashboard` to `Dashboard`
- Kept the action row responsive with wrapping on narrow screens

Design intent:

- Keep contact information visible without creating a separate contact page.
- Make the hero section feel like a practical developer profile header.
- Keep Dashboard, resume, email, and GitHub at the same interaction level.

---

## Resume Preview

New files:

```txt
src/components/home/resume-dialog.tsx
public/resume/YangChangHao-resume.pdf
```

Behavior:

- The `履歷` button opens a modal preview.
- The modal embeds the PDF directly with an iframe.
- The modal supports Escape to close.
- A secondary icon opens the PDF in a new tab.

Why this approach:

- Visitors can inspect the resume without leaving the homepage.
- The PDF remains a normal static asset and can be linked directly.
- The implementation stays simple and avoids adding a PDF rendering library.

---

## LeetCode Auto Sync

Updated files:

```txt
extension/src/content.ts
src/components/detail/solution-tabs.tsx
src/hooks/use-records.ts
src/app/problems/[id]/page.tsx
```

Problem:

After solving a problem with a second approach, for example rewriting a DFS solution as BFS, the website could still show the old solution until a manual capture happened.

Root causes:

- The Extension could read the editor too late, after the accepted submission flow had already changed page state.
- The problem detail page did not always refresh after Supabase updated `solutions`.

Fix:

- Capture a code snapshot as soon as Submit is detected.
- Prefer the submitted snapshot if the later editor read looks incomplete.
- Mark auto-synced submissions with accepted/manual metadata.
- Subscribe to Supabase changes in the detail page.
- Poll as a fallback so the UI still updates if Realtime is not enabled.

---

## Build Script Adjustment

Updated file:

```txt
extension/build.js
```

The Extension build script now transforms each standalone TypeScript file into the `extension/dist` output. This avoids resolver issues in restricted local environments while preserving the generated browser scripts.

---

## Validation

Commands run:

```bash
npm run ext:build
npm run lint
npm run build
```

Results:

- Extension build passed.
- Lint passed with one existing warning in `src/components/detail/code-visualizer.tsx`.
- Production build passed.
