import { Hono } from "hono";
import { sql } from "../lib/db.js";
import { logError } from "../lib/logger.js";

const router = new Hono();

// Health check
router.get("/health", (c) =>
  c.json({ ok: true, service: "api", env: process.env.NODE_ENV })
);

// DB connection test
router.get("/hello", async (c) => {
  try {
    const [{ now }] = await sql`SELECT now()`;
    return c.json({ message: "Hello", dbTime: now });
  } catch (e) {
    await logError("DB connection error", { error: e });
    return c.json({ error: "Database connection failed" }, 500);
  }
});

export default router;
