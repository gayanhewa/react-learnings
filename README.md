# React refresher for backend developers

A small full-stack app where each route teaches one modern React concept, with
explicit parallels to how it'd work in a production system.

- **Frontend** - React + Vite + React Router (TypeScript)
- **Backend** - Express running on Bun (TypeScript)
- **Styling** - plain CSS
- **Layout** - Bun workspaces monorepo (`client/` + `server/`)

## How to use this project

It's built to be read and run, not just cloned. Each route is a self-contained
lesson, ordered roughly from naive to modern, each with a `LESSON.md` and grep-able
`// PROD:` / `// CONCEPT:` / `// GOTCHA:` comments.

- Read **[LEARNING.md](./LEARNING.md)** for the lesson index and conventions.
- Run `bun run dev`, then click through the nav from left to right.
- For each route, open its `LESSON.md` (e.g. `client/src/routes/query/LESSON.md`)
  and follow the **Try this** section while reading the commented code.
- `grep -rn "// PROD:" client/src` to read every production parallel in one pass.

Lessons, in order: `/` (useEffect baseline), `/items` (loader + discriminated
union), `/query` (TanStack Query), `/new-item` (React 19 form hooks),
`/dashboard` (Context + Zustand), `/mutate` (useMutation + cache invalidation),
`/patterns` (composition + useReducer).

Run the tests with `bun run test` (Vitest + React Testing Library).

## Setup

```bash
bun install
```

## Run (dev)

Starts the Vite dev server and the Express API together:

```bash
bun run dev
```

- Client: http://localhost:5173
- API: http://localhost:3001

Vite proxies `/api/*` to the API server, so the frontend calls `/api/items`
with no CORS setup.

Run them individually if you prefer:

```bash
bun run dev:client
bun run dev:server
```

## Routes

**Frontend**

| Path     | Page  |
| -------- | ----- |
| `/`      | Home (fetches `/api/items`) |
| `/about` | About |

**API**

| Method | Path          | Returns                       |
| ------ | ------------- | ----------------------------- |
| GET    | `/api/health` | `{ status, uptime }`          |
| GET    | `/api/items`  | array of `{ id, name }`       |

## Build (production)

```bash
bun run build   # builds client into client/dist
bun run start   # runs the API server
```
