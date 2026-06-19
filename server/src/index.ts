import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

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
