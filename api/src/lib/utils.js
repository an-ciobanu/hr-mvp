import { sql } from "./db.js";

// RBAC helper: returns true if user is self or manager of target
/**
 * Middleware to ensure user has required role
 * @param {string} role - Required role
 */
function ensureRole(role) {
  return async (c, next) => {
    const { getUserFromCookie } = await import("../lib/jwt.js");
    const user = getUserFromCookie(c);
    if (!user || user.role !== role) {
      return c.json({ error: "Forbidden" }, 403);
    }
    return next();
  };
}

async function isEmployeeOrManager(user, targetUserId) {
  if (!user) return false;
  if (user.id === targetUserId) return true;
  const res =
    await sql`SELECT manager_id FROM users WHERE id = ${targetUserId}`;
  return res[0] && res[0].manager_id === user.id;
}

export { isEmployeeOrManager, ensureRole };
