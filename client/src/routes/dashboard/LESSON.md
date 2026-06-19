# Lesson: client state (Context + Zustand)

**Route:** `/dashboard` · **Concept:** client state, and how it differs from server state

## The headline distinction (the #1 architecture decision)

| | Server state | Client state |
| --- | --- | --- |
| Lives where | on the server, you cache a copy | only in the browser |
| Examples | items list, user profile, orders | theme, modal open, wizard step, cart |
| Tool | **TanStack Query** (`/query`) | `useState` / Context / **Zustand** |
| Key concern | staleness, refetch, invalidation | sharing without prop-drilling, re-renders |

Mixing these up is the most common architecture mistake. Don't put server data in
Zustand/Redux (you'll reinvent caching badly); don't put UI toggles in TanStack Query.

## Two tools, shown side by side

**React Context (theme toggle)** - React's built-in, zero deps.
- `createContext` → `<Provider value={...}>` → `useContext`.
- Best for app-wide, rarely-changing values: **auth/user, theme, locale, feature flags**.
- GOTCHA: every consumer re-renders on ANY change - no selective subscription.

**Zustand (counter)** - the pragmatic 2026 default for client state.
- `create()` a store OUTSIDE React; no Provider needed.
- Components subscribe with a **selector** (`useStore(s => s.count)`) → re-render only
  when their slice changes. This is the scaling advantage over Context.

## The production parallel

- **Context = configuration/identity** that's read widely but written rarely. Auth
  provider and theme provider near the app root is the textbook pattern.
- **Zustand = interactive global UI state** touched by many unrelated components
  (cart, sidebar, multi-step flow). Selectors keep re-renders surgical.
- **Skip Redux Toolkit** unless you're on a large team that needs enforced patterns,
  middleware, and time-travel debugging - Zustand covers the same concept with far
  less ceremony. Learn whichever the team actually uses.
- With TanStack Query owning server state, the *amount* of client state you need
  shrinks a lot - many apps end up with just a small Zustand store + a couple Contexts.

## Try this

1. Toggle the theme - the section recolors (Context value flows to the consumer).
2. Click +1 a few times, navigate to `/about` and back - count **resets** (client
   state is in-memory; it dies on unmount/reload, unlike server state).
3. Note `CounterButtons` reads only the actions: it never re-renders when the count
   changes. Open React DevTools' "Highlight updates" to see only `CounterDisplay` flash.

## When to use which

- One component's state → `useState`.
- A handful of components, rarely-changing → **Context**.
- Many components, frequently-changing, or you want selectors → **Zustand**.
- It's data from your API → none of these - **TanStack Query** (`/query`).
