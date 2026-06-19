# Lesson: mutations + cache invalidation

**Route:** `/mutate` · **Concept:** writing server state with TanStack Query
**Backend:** `POST /api/items`

## What it teaches

`useQuery` reads server state; **`useMutation`** writes it. The pairing - mutate,
then **invalidate** the affected query - is how a TanStack app keeps the UI
consistent after a write, without hand-syncing state across screens.

This is the production counterpart to `/new-item`. That route used React 19 hooks
with a *local* optimistic list (self-contained, no cache). This one writes through
the shared cache, so other screens stay in sync.

## The flow

1. `useMutation({ mutationFn: createItem })` - the write, triggered by `mutate()`.
2. On success, `queryClient.invalidateQueries({ queryKey: ["items"] })` marks the
   cached list stale and refetches it.
3. Every component using `["items"]` - here AND on `/query` - re-renders with fresh data.

## The production parallel

- **Reads vs writes are different primitives.** `useQuery` runs on render and caches;
  `useMutation` runs on demand and has side effects. Don't fetch-to-write or write-on-render.
- **The queryKey is the contract.** Because `/query`, `/mutate`, and any future screen
  all key on `["items"]`, one invalidation refreshes them all. This is why teams
  standardize query keys (often in a central `queryKeys` factory).
- **Invalidate, don't manually patch.** Rather than "after save, also push the new item
  into this other component's state," you invalidate and let the cache refetch the truth.
  Fewer bugs, always consistent with the server.
- **Optimistic mutations** (next level): `onMutate` to update the cache immediately +
  `onError` to roll back is the cache-integrated version of `/new-item`'s `useOptimistic`.

## Try this

1. Add an item - the list updates after the POST + refetch.
2. Open `/query` in a second tab, add an item here, switch to `/query` within 30s -
   the new item is already there (shared cache, invalidation triggered a refetch).
3. Add a name containing `fail` - the server returns 422, `isError` flips, the list
   is untouched (no invalidation on failure).

## When to use which

- Writing data that other screens read -> **useMutation + invalidateQueries** (this route).
- A self-contained form where the result stays local -> React 19 form hooks (`/new-item`).
- Both can use optimistic UI; useMutation's version also updates the shared cache.
