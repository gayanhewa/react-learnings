import express from "express";
import { createHmac, randomBytes } from "node:crypto";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

// ===========================================================================
// SESSION / AUTH LESSON (see client/src/routes/auth/LESSON.md)
//
// PROD: in a real app you would NOT hand-write any of this - you'd use a
// library (Better Auth, Auth.js, Clerk, Supabase Auth). This minimal version
// exists to show what those libraries do internally: issue a short-lived
// access token + a long-lived, revocable refresh token, both in httpOnly
// cookies, and refresh the access token when it expires.
// ===========================================================================

// PROD: signing secret comes from env/secrets manager, never hard-coded.
const SECRET = "dev-only-secret-do-not-use-in-prod";
const ACCESS_TTL_MS = 10_000; // 10s so you can SEE expiry+refresh in the demo
const DEMO_USER = { id: 1, email: "demo@example.com", password: "password" };

// PROD: this Set is the "stateful" half - the refresh-token store (Redis/DB in
// prod). Storing refresh tokens is what lets us REVOKE them (logout everywhere),
// the revocation power a pure stateless JWT can't give you.
const validRefreshTokens = new Set<string>();

// A tiny signed token: base64(payload).hmac. Stands in for a real JWT.
// PROD: use a vetted lib (jsonwebtoken / jose) - it handles alg, exp, claims.
function sign(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${mac}`;
}
function verify(token: string | undefined): any | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", SECRET).update(body).digest("base64url");
  if (mac !== expected) return null; // tampered/invalid signature
  const payload = JSON.parse(Buffer.from(body, "base64url").toString());
  if (payload.exp && Date.now() > payload.exp) return null; // expired
  return payload;
}

// Minimal cookie parser (PROD: use cookie-parser / your framework's built-in).
function getCookie(req: express.Request, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

// Set an httpOnly cookie. The httpOnly flag is the whole point: JS on the page
// CANNOT read it, so an XSS injection can't steal the token.
// PROD: also set Secure (HTTPS only) and a sensible SameSite for CSRF defense.
function setAuthCookie(res: express.Response, name: string, value: string) {
  res.cookie(name, value, {
    httpOnly: true,
    sameSite: "lax", // CSRF mitigation; pairs with a CSRF token in real apps
    // secure: true,  // enable behind HTTPS in production
  });
}

// POST /api/login - exchange credentials for access + refresh cookies.
app.post("/api/login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (email !== DEMO_USER.email || password !== DEMO_USER.password) {
    return res.status(401).json({ error: "invalid credentials" });
  }
  const accessToken = sign({ sub: DEMO_USER.id, exp: Date.now() + ACCESS_TTL_MS });
  const refreshToken = randomBytes(24).toString("hex");
  validRefreshTokens.add(refreshToken); // remember it so we can revoke later
  setAuthCookie(res, "accessToken", accessToken);
  setAuthCookie(res, "refreshToken", refreshToken);
  res.json({ user: { id: DEMO_USER.id, email: DEMO_USER.email } });
});

// POST /api/refresh - mint a new access token if the refresh token is valid.
// PROD: rotate the refresh token here too (issue a new one, invalidate the old)
// to limit the damage of a stolen refresh token.
app.post("/api/refresh", (req, res) => {
  const refreshToken = getCookie(req, "refreshToken");
  if (!refreshToken || !validRefreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: "invalid refresh token" });
  }
  const accessToken = sign({ sub: DEMO_USER.id, exp: Date.now() + ACCESS_TTL_MS });
  setAuthCookie(res, "accessToken", accessToken);
  res.json({ ok: true });
});

// POST /api/logout - clear cookies AND revoke the refresh token server-side.
app.post("/api/logout", (req, res) => {
  const refreshToken = getCookie(req, "refreshToken");
  if (refreshToken) validRefreshTokens.delete(refreshToken); // revocation
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ ok: true });
});

// GET /api/me - the protected endpoint. 401 if no valid access token; the
// client treats that 401 as "try refreshing, then retry".
app.get("/api/me", (req, res) => {
  const payload = verify(getCookie(req, "accessToken"));
  if (!payload) return res.status(401).json({ error: "not authenticated" });
  res.json({ user: { id: DEMO_USER.id, email: DEMO_USER.email } });
});

// In-memory store so POSTed items actually persist for the session.
// PROD: this is your database. Swap for Postgres/etc; the route shape is the same.
type Item = { id: number; name: string };
let items: Item[] = [
  { id: 1, name: "First item" },
  { id: 2, name: "Second item" },
  { id: 3, name: "Third item" },
];
let nextId = 4;

// Small helper to simulate real network/DB latency so the client's optimistic
// UI is observable (the row appears instantly, before this resolves).
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// GET /api/health - liveness check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// GET /api/items - current list
app.get("/api/items", (_req, res) => {
  res.json(items);
});

// POST /api/items - create one item
app.post("/api/items", async (req, res) => {
  await delay(1000); // simulate latency so optimistic UI is visible

  const name = (req.body?.name ?? "").trim();

  // PROD: validate at the boundary and return 400 on bad input. Never trust the
  // client. (This is the server-side half of the client's Zod/Either instinct.)
  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }
  // Contrived rule so you can watch an optimistic update get ROLLED BACK:
  // any name containing "fail" is rejected by the server.
  if (name.toLowerCase().includes("fail")) {
    return res.status(422).json({ error: `rejected: "${name}"` });
  }

  const item: Item = { id: nextId++, name };
  items.push(item);
  res.status(201).json(item); // 201 Created + the canonical server record
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
