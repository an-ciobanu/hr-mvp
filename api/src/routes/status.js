import { Hono } from "hono";
import { sql } from "../lib/db.js";

const router = new Hono();

// Health check
router.get("/health", (c) =>
  c.json({ ok: true, service: "api", env: process.env.NODE_ENV || "dev" })
);

// DB connection test
router.get("/hello", async (c) => {
  try {
    const [{ now }] = await sql`SELECT now()`;
    return c.json({ message: "Hello", dbTime: now });
  } catch (e) {
    console.error("DB connection error:", e);
    return c.json({ error: "Database connection failed" }, 500);
  }
});

export default router;
