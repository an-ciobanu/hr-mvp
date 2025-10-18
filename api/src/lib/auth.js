import { getUserFromCookie } from "./jwt.js";

/**
 * Middleware to require authentication and attach user to context
 */
export function requireAuth() {
  return async (c, next) => {
    const cookie = c.req.header("Cookie") || "";
    const user = getUserFromCookie(cookie);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    c.set("user", user);
    return next();
  };
}

// Simple UUID v4 validation (hyphenated)
function isUuid(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str
  );
}
/**
 * Middleware to require user to be self or their manager for a given userId param
 */
export function requireSelfOrManager(param = "userId") {
  return async (c, next) => {
    const user = c.get("user");
    const targetUserId = c.req.param(param);
    if (!user || !targetUserId) {
      return c.json({ error: "Forbidden" }, 403);
    }
    if (!isUuid(targetUserId)) {
      return c.json({ error: "Invalid user id" }, 400);
    }
    if (user.id === targetUserId) return next();
    const { sql } = await import("./db.js");
    const res =
      await sql`SELECT manager_id FROM users WHERE id = ${targetUserId}`;
    if (res[0] && res[0].manager_id === user.id) return next();
    return c.json({ error: "Forbidden" }, 403);
  };
}
