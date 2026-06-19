# Lesson: TanStack Query

**Route:** `/query` · **Concept:** server-state management

## What it teaches

`useQuery` replaces the entire `useEffect` + 3×`useState` dance from the `/` route
with one declarative call. You describe *what* data you want (`queryKey`) and *how*
to get it (`queryFn`); the library owns caching, loading/error state, deduplication,
and background revalidation.

## Compare the two routes

| | `/` (useEffect) | `/query` (TanStack Query) |
| --- | --- | --- |
| State you manage | data + loading + error by hand | none - the hook returns it |
| Caching | none (refetches every mount) | cached by `queryKey` |
| Duplicate requests | each component fetches again | deduped automatically |
| Background refresh | you'd build it | built in (`staleTime`) |

## The production parallel

- **`queryKey` = cache namespace.** Same key → shared cache + shared in-flight
  request across the whole app. This is the mechanism mutations use to invalidate.
- **`staleTime`/`retry`/refetch-on-focus** are policy you set once on the
  `QueryClient` - the client-side analogue of HTTP cache headers + retry/backoff.
- **`queryFn` is your API client layer** - pure async functions, no React, reusable.
- This is why teams stop hand-rolling `useEffect` fetches: at scale you need
  caching, dedup, and invalidation, and reinventing them per-component is a bug farm.

## Try this

1. Visit `/query`, then click **Refetch** - watch "Revalidating..." while old data stays.
2. Navigate to `/about` and back **within 30s** - data is instant (served from cache,
   `isPending` never true).
3. Wait >30s (past `staleTime`), come back - instant data PLUS a background refetch.
4. Break the URL in `fetchItems` (e.g. `/api/itemzzz`) - see the error state + retry.

## When NOT to use it

- Pure **client** state (UI toggles, form drafts, selected tab) - that's not server
  state; use `useState`/Context/Zustand (`/dashboard` lesson).
- Trivial one-shot fetches where you'll never cache, refetch, or share. A loader or
  `useEffect` is fine. TanStack earns its keep when data is reused and must stay fresh.
