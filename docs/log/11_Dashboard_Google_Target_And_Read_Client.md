# 11 — Dashboard Google Target And Read Client

Date: 2026-05-18

## What Changed

This update keeps the Google target-company idea, but makes it less visible during normal portfolio review.

- The Google target banner now sits at the bottom of `/dashboard`.
- The section is dark and blurred by default.
- There is no visible `Reveal` button.
- Clicking the whole dark section toggles the hidden Google content.
- Keyboard users can also toggle it with `Enter` or `Space`.

The Dashboard also no longer requires `SUPABASE_SERVICE_ROLE_KEY` just to load read-only pages locally.

## Files Updated

- `src/components/dashboard/goal-banner.tsx`
- `src/app/dashboard/page.tsx`
- `src/lib/leetcode-records.ts`
- `src/lib/projects.ts`
- `src/app/api/records/route.ts`
- `src/app/problems/[id]/page.tsx`

## Supabase Client Split

Read-only pages now use the regular Supabase server client:

- `/`
- `/dashboard`
- `/projects`
- `/problems`
- `/problems/[id]`
- `GET /api/records`

Trusted write paths still use the admin client and still require `SUPABASE_SERVICE_ROLE_KEY`:

- `POST /api/webhook`
- `PATCH /api/records/[id]`
- `DELETE /api/records/[id]`
- `POST /api/fetch-description`
- Admin project mutations

This keeps local browsing easier while preserving stronger access for server-side writes.

## Verification

Commands run:

```bash
npm run lint
npm run build
```

Result:

- Lint passed with the existing `VizStructure` unused warning.
- Build passed.
- Local `/dashboard` responded successfully after removing the read-page dependency on the service role key.
