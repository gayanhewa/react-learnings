# Lesson: React 19 form hooks

**Route:** `/new-item` · **Concept:** native form lifecycle + optimistic UI
**Backend:** `POST /api/items` (Express)

## What it teaches

Three React 19 hooks that replace hand-rolled form plumbing:

- **`useActionState(action, initial)`** - owns the submit lifecycle. You write an
  async `(prevState, formData) => newState`; React tracks pending and re-runs it
  on `<form action={...}>` submit. Replaces `onSubmit` + `useState(loading)` +
  `try/catch`.
- **`useOptimistic(real, reducer)`** - render a *predicted* result while the action
  is in flight; React auto-reverts to the real state when it settles (or fails).
- **`useFormStatus()`** - a child component reads the parent form's `pending` with
  no prop drilling (e.g. the submit button disables itself).

## The full-stack round trip

1. You submit → optimistic row appears instantly (`id: -1`, "saving...").
2. `POST /api/items` runs (1s delay) → server validates, returns the real record.
3. Success → action commits the canonical server item (real `id`).
4. Failure (name contains `fail` → 422) → action returns the unchanged list →
   React drops the optimistic row automatically (**rollback**).

## The production parallel

- **Optimistic UI** is what makes apps feel instant (think: sending a chat message,
  liking a post). The pattern is always: show the guess, reconcile with the server,
  roll back on failure. `useOptimistic` is the native version; TanStack Query's
  `useMutation` `onMutate`/`onError`/`onSettled` is the same idea with cache integration.
- **Trust the server's record, not your guess.** The optimistic row uses a fake
  `id: -1`; the committed row uses the server's real `id`. Never let the placeholder
  become the source of truth.
- **Validate on BOTH sides.** Client guard for UX (empty name), server guard for
  correctness (400/422). The server is the only one you can trust - the client check
  is just to save a round trip.
- **`POST` returns `201` + the created resource** - REST convention so the client
  gets the authoritative record (id, server-set fields) without a second GET.

## Try this

1. Add a normal item → watch "saving..." for 1s, then it commits.
2. Add an item named `fail me` → optimistic row appears, then **vanishes** when the
   server returns 422 (rollback). An `alert` shows the error (a real app = inline UI).
3. Submit empty → client guard blocks it before any request.

## When NOT to use it

- **Complex forms** (many fields, cross-field rules, dynamic arrays) - use React
  Hook Form + Zod; it's uncontrolled (fewer re-renders) and has richer validation.
- When the new data must update a **shared cache** other screens read - combine with
  TanStack Query's `useMutation` + `invalidateQueries(["items"])` so `/query` updates too.
