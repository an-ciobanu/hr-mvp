import { Hono } from "hono";
import { cors } from "hono/cors";
import { logError } from "./lib/logger.js";

const app = new Hono();
const port = Number(process.env.PORT);

// Middleware
app.use(
  "/api/*",
  cors({
    origin: process.env.WEB_URL || "http://localhost:5173",
    credentials: true,
  })
);

import authRoutes from "./routes/auth.js";
import statusRoutes from "./routes/status.js";
import employeeRoutes from "./routes/employees.js";

if (process.env.NODE_ENV == "development") {
  app.route("/api", statusRoutes);
}

app.route("/api/auth", authRoutes);
app.route("/api/employees", employeeRoutes);

app.onError((err, c) => {
  logError("Server error", { error: err });
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
