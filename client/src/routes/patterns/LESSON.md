# Lesson: composition + useReducer

**Route:** `/patterns` · **Concept:** component composition and complex local state

## Part 1 - Composition via `children`

Instead of configuring a component with many props, let the caller pass JSX as
`children`. The component owns structure; the caller owns content.

- A `<Card>` that takes `children` works for *any* content - no `title`/`body` props.
- **Compound components** (`Card.Header`) share context by nesting position, not props.
- The type for "anything renderable" is `React.ReactNode`.

**Production parallel:** this is how design systems are built. Composition over
configuration means fewer props, less prop-drilling, and components that flex to
cases you didn't anticipate. Your backend instinct for good interfaces transfers
directly - a component's `children` API is just its public contract.

## Part 2 - `useReducer` for complex local state

`useReducer` is `useState`'s bigger sibling: when state has several related fields
and multiple transitions, centralize the logic in one pure reducer function.

- `dispatch({ type: "increment" })` describes *what happened*; the reducer decides
  *how state changes*.
- It's the same reducer pattern as Redux, built into React, scoped to one component.

**Production parallel:** reach for it when `useState` calls multiply and start
depending on each other (forms with interdependent fields, wizards, toggles with
rules). One pure function is easier to test and reason about than scattered setState.

## When to use which

- One or two independent values -> `useState`.
- Several related fields with structured transitions -> `useReducer`.
- Shared across many components -> Zustand / Context (`/dashboard`).
- Server data -> TanStack Query (`/query`, `/mutate`).

## Note: memoization is automatic now (React Compiler)

You will NOT find `useMemo`, `useCallback`, or `React.memo` anywhere in this project.
That is intentional. The **React Compiler** (stable, v1.0, Oct 2025) auto-memoizes at
build time - it analyzes which values depend on which state and inserts memoization
for you.

**Before (pre-2025):** you hand-wrapped expensive calculations and callbacks:

```tsx
const sorted = useMemo(() => items.sort(byName), [items]);
const onClick = useCallback(() => doThing(id), [id]);
```

**Now:** write the plain version; the compiler handles it.

```tsx
const sorted = items.sort(byName); // compiler memoizes if needed
const onClick = () => doThing(id);
```

Existing `useMemo`/`useCallback` in old codebases are safe but redundant. Knowing
this - and deliberately NOT reaching for manual memoization - is itself the senior move.
