import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "./lib/logger.js";

const app = new Hono();
const port = Number(process.env.PORT);

app.use(
  "/api/*",
  cors({
    origin: process.env.WEB_URL,
    credentials: true,
  })
);

import authRoutes from "./routes/auth.js";
import statusRoutes from "./routes/status.js";
import employeeRoutes from "./routes/employees/index.js";
import profileRoutes from "./routes/profiles/index.js";
import feedbackRoutes from "./routes/feedback/index.js";
import absenceRoutes from "./routes/absences/index.js";

if (process.env.NODE_ENV == "development") {
  app.route("/api", statusRoutes);
}

app.route("/api/auth", authRoutes);
app.route("/api/employees", employeeRoutes);
app.route("/api/profiles", profileRoutes);
app.route("/api/feedback", feedbackRoutes);
app.route("/api/absences", absenceRoutes);

app.onError((err, c) => {
  logger.error("Server error", err);
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
