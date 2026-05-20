# 12 Portfolio Card Layout And Copy

Date: 2026-05-21

## What Changed

This update improves the portfolio cards and cleans up the project descriptions.

The visible result:

- Project cards now keep their tech tags and bottom-right arrow aligned at the bottom.
- Project descriptions no longer start with `Goal:`.
- Descriptions now read like completed work, for example `Implemented`, `Built`, `Trained`, `Used`, and `Applied`.
- The same description updates were synced to Supabase, so the deployed website reads the latest copy instead of old mock text.

## Why This Was Needed

Before this change, each card description could have a different length. The arrow already had `mt-auto`, but the tech tags were above it in a separate block. That meant the card bottoms could feel visually uneven.

The fix was to treat the tags and arrow as one bottom area:

```tsx
<div className="mt-auto pt-5">
  <div className="flex flex-wrap gap-2">
    {/* tags */}
  </div>

  <div className="flex justify-end pt-5">
    {/* arrow */}
  </div>
</div>
```

This matters because `mt-auto` only pushes the element it is attached to. If only the arrow has `mt-auto`, then only the arrow is forced downward. If the whole bottom group has `mt-auto`, then both tags and arrow stay together at the bottom.

## Files Updated

- `src/components/portfolio/project-card.tsx`
- `src/lib/mock-data.ts`
- `supabase/projects_seed.sql`
- `README.md`
- `docs/log/README.md`
- `docs/log/12_Portfolio_Card_Layout_And_Copy.md`

## Data Sources To Remember

Portfolio descriptions can appear from two places:

1. `src/lib/mock-data.ts`
   - Used when the app falls back to local mock project data.
   - Useful for local preview and emergency fallback.

2. Supabase `projects` table
   - Used by the deployed website when Supabase is available.
   - This is what the production homepage usually reads.

Because the homepage reads Supabase first, changing only `mock-data.ts` is not enough for the deployed site. If the copy needs to change on production, update Supabase too.

## Supabase Sync Note

The project descriptions were updated in the live `projects` table with the server-side Supabase service role key.

Do not expose the service role key in client components, browser console code, screenshots, or README examples. It is only for trusted server-side scripts and Server Actions.

## Beginner Code Review Notes

When reviewing a card layout bug like this, ask:

- Is the card outer wrapper using `flex flex-col h-full`?
- Is the content area allowed to grow with `flex-1`?
- Is the part that should stick to the bottom wrapped in one container?
- Is `mt-auto` on the whole bottom group, not only on one small child?
- Do long descriptions break alignment?
- Does the card still look okay on mobile and desktop grid layouts?

When reviewing data-copy changes, ask:

- Did we update mock data?
- Did we update seed SQL?
- Did we update the live Supabase table if production reads from Supabase?
- Did we avoid leaking any secret keys while doing the sync?

## Verification

Commands run:

```bash
npm run lint
npm run build
```

Result:

- Lint passed with the existing `VizStructure` unused warning in `src/components/detail/code-visualizer.tsx`.
- Build passed.
- Supabase project descriptions were updated successfully.

