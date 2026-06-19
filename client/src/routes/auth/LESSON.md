# Lesson: session management

**Route:** `/auth` · **Concept:** browser sessions, JWT access + refresh, httpOnly cookies
**Backend:** `POST /api/login`, `POST /api/refresh`, `POST /api/logout`, `GET /api/me`

> **In production you would NOT write this by hand.** Use a library. This lesson
> builds a minimal version so the libraries stop being magic - so you can
> configure them correctly and debug them when sessions misbehave.

## The flow this implements

1. **Login** - server verifies credentials, sets TWO httpOnly cookies:
   a short-lived **access token** (JWT-like, 10s here) and a long-lived,
   server-tracked **refresh token**.
2. **Authenticated requests** - the browser auto-sends the cookies. JS never
   reads them (that's what `httpOnly` means).
3. **Access token expires** - `GET /api/me` returns 401. `authFetch` calls
   `/api/refresh` once, gets a fresh access token, and retries the request.
4. **Logout** - clears the cookies AND deletes the refresh token server-side
   (revocation).

## The two axes (don't conflate them)

- **Token format:** opaque session id (stateful, instantly revocable) vs JWT
  (stateless, fast, but can't be revoked before expiry).
- **Browser storage:** httpOnly cookie (XSS-safe, needs CSRF defense) vs
  localStorage (readable by any JS = XSS steals it - avoid) vs in-memory.

The production sweet spot, and what this lesson does: **short-lived JWT access
token + long-lived, server-tracked refresh token, both in httpOnly cookies.**
Stateless speed per request, plus revocation via the refresh store.

## The pieces (and the production parallel)

- **`authFetch`** - the 401 -> refresh -> retry interceptor, with a
  **single-flight guard** so concurrent 401s share ONE refresh (the bug most
  hand-rolled versions have). PROD: this is what an axios interceptor / auth
  library middleware does for you.
- **`AuthContext`** - app-wide current user via `useAuth()`. PROD: a library's
  `<AuthProvider>` + `useUser()`/`useSession()`.
- **Route guard** - render login vs protected based on session. PROD: often a
  React Router `loader` that redirects before render (see the `/items` lesson).
- **Refresh-token store** (server `Set`) - the stateful half that enables
  revocation. PROD: Redis or a DB table.

## Libraries (2026) - what you'd actually use

| Tool | Type | Use when |
| --- | --- | --- |
| **Clerk** | hosted service | want it done, pre-built React UI, ship fast |
| **Better Auth** | self-hosted lib | own your data, TS-native, modern stack |
| **Supabase Auth** | bundled backend | already on Supabase (DB-enforced authz) |
| **Auth0** | hosted service | enterprise SSO/SAML, compliance |
| **Auth.js** | self-hosted lib | established incumbent; less the default for new apps |

They all implement the flow above internally (httpOnly cookies, refresh
rotation, CSRF). The senior move is knowing the pattern well enough to pick
and configure the right one - not to ship your own.

## Try this

1. Log in (creds pre-filled) - the protected view appears.
2. Click **Call /api/me** immediately - `200 OK`.
3. Wait ~10s (access token expires), click **Call /api/me** again - it still
   returns `200`, because the first call 401'd, `authFetch` refreshed, and
   retried. Watch the Network tab: you'll see `me` (401) -> `refresh` -> `me` (200).
4. Log out, then **Call /api/me** - `401` (refresh token revoked server-side).

## When to use which token strategy

- One app, one backend, want easy revocation -> **opaque server session** in an
  httpOnly cookie. The simplest correct default.
- SPA + separate API, or services that verify locally -> **JWT access + refresh**
  (this lesson).
- Non-browser client (mobile, m2m) -> JWT in an `Authorization` header, no cookie.
- Any browser app -> **don't put tokens in localStorage.**
