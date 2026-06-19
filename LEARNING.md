# Learning project

A React refresher for backend developers. Each **route is one self-contained
lesson** - you can study any one without reading the others, and delete any one
without breaking the rest.

## How to read a lesson

Every lesson file uses a fixed comment vocabulary so your eye learns where to look:

- `// CONCEPT:` - the React idea this line/block teaches
- `// PROD:` - the parallel to a real production system
- `// GOTCHA:` - the trap people hit

Grep any of them across the repo to read one theme at a time:

```bash
grep -rn "// PROD:" client/src      # every production parallel in one pass
grep -rn "// GOTCHA:" client/src    # every trap
```

Each lesson route also has a short `LESSON.md` next to it: what it teaches, the
production parallel, what to try, and when NOT to use it in real life.

## The lessons

| Route        | Lesson                                   | Status |
| ------------ | ---------------------------------------- | ------ |
| `/`          | useEffect fetch - the naive baseline     | done   |
| `/items`     | loader + discriminated union (no casts)  | done   |
| `/query`     | TanStack Query (server state)            | done   |
| `/new-item`  | React 19 form hooks (`POST /api/items`)  | done   |
| `/dashboard` | client state: Context + Zustand          | done   |
| `/mutate`    | useMutation + cache invalidation         | done   |
| `/patterns`  | composition + useReducer                 | done   |

Testing: `/patterns` has a Vitest + React Testing Library suite
(`client/src/routes/patterns/Patterns.test.tsx`). Run `bun run test`.

## 2026 context

- **React Compiler is stable** (v1.0): memoization is automatic. You will NOT see
  `useMemo`/`useCallback` in these lessons on purpose - writing them by hand is now
  redundant. (See `client/src/routes/patterns/LESSON.md` for the before/after.)
- **`useEffect` for derived/synced state is an anti-pattern** - compute in the render
  body instead. The `/` route keeps a raw `useEffect` *fetch* as a baseline to compare
  against `/query`, not as a recommendation.
