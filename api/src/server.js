import { Hono } from "hono";
import { cors } from "hono/cors";
import postgres from "postgres";

const app = new Hono();
const port = Number(process.env.PORT || 3001);
const databaseUrl =
  process.env.DATABASE_URL || "postgres://hrmvp:hrmvp@localhost:5432/hrmvp";

const sql = postgres(databaseUrl, { prepare: true });

// Middleware
app.use(
  "/api/*",
  cors({
    origin: process.env.WEB_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Health check
app.get("/health", (c) =>
  c.json({ ok: true, service: "api", env: process.env.NODE_ENV || "dev" })
);

// DB connection test
app.get("/api/hello", async (c) => {
  try {
    const [{ now }] = await sql`SELECT now()`;
    return c.json({ message: "Hello", dbTime: now });
  } catch (e) {
    console.error("DB connection error:", e);
    return c.json({ error: "Database connection failed" }, 500);
  }
});

// TODO: Add route imports here

app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`[api] listening on http://localhost:${port}`);
