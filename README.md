# React refresher for backend developers

A small full-stack app where each route teaches one modern React concept, with
explicit parallels to how it'd work in a production system.

- **Frontend** - React + Vite + React Router (TypeScript)
- **Backend** - Express running on Bun (TypeScript)
- **Styling** - plain CSS
- **Layout** - Bun workspaces monorepo (`client/` + `server/`)

## Quick start

```bash
bun install
bun run dev      # client on :5173, API on :3001
```

Open http://localhost:5173 and click through the nav from left to right - the
routes are ordered from naive to modern. Vite proxies `/api/*` to the API
server, so there's no CORS setup.

```bash
bun run test     # Vitest + React Testing Library
bun run build    # build the client into client/dist
bun run start    # run the API server
```

## The lessons

Each route is a self-contained lesson with its own `LESSON.md` next to the code
(what it teaches, the production parallel, what to try, when NOT to use it).

| Route        | Teaches                                            |
| ------------ | -------------------------------------------------- |
| `/`          | `useEffect` fetch - the naive baseline             |
| `/items`     | route loader + a discriminated union (no casts)    |
| `/query`     | TanStack Query (server state)                      |
| `/new-item`  | React 19 form hooks (`POST /api/items`)            |
| `/dashboard` | client state: Context + Zustand                    |
| `/mutate`    | `useMutation` + cache invalidation                 |
| `/patterns`  | composition + `useReducer` (+ React Compiler note) |
| `/auth`      | session management (JWT access/refresh + cookies)  |

Tests live with the code they cover, e.g.
`client/src/routes/patterns/Patterns.test.tsx`.

## How to read a lesson

Run the app, then for each route open its `LESSON.md` and follow the **Try this**
section while reading the commented code. The comments use a fixed vocabulary:

- `// CONCEPT:` - the React idea this block teaches
- `// PROD:` - the parallel to a real production system
- `// GOTCHA:` - the trap people hit

Grep one theme at a time:

```bash
grep -rn "// PROD:" client/src      # every production parallel in one pass
grep -rn "// GOTCHA:" client/src    # every trap
```

## Offline reading

All lessons (write-ups + annotated source) are bundled into
[`react-learnings.pdf`](./react-learnings.pdf) for reading on the go.
Regenerate it after changing lessons with `bun run pdf` (needs `pandoc` and
Chrome).

## 2026 notes

- **React Compiler is stable** (v1.0): memoization is automatic. There is no
  `useMemo`/`useCallback` here on purpose - writing it by hand is now redundant.
  See `client/src/routes/patterns/LESSON.md` for the before/after.
- **`useEffect` for derived/synced state is an anti-pattern** - compute in the
  render body instead. The `/` route keeps a raw `useEffect` *fetch* only as a
  baseline to compare against `/query`, not as a recommendation.
