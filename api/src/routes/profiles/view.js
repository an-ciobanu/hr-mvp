import { sql } from "../../lib/db.js";
import { errorResponse, infoLog } from "../../lib/error.js";
import { requireAuth, requireSelfOrManager } from "../../lib/auth.js";
import { Hono } from "hono";

const router = new Hono();

router.get("/me", requireAuth(), async (c) => {
  const user = c.get("user");
  try {
    const profile =
      await sql`SELECT * FROM profiles WHERE user_id = ${user.id}`;
    if (!profile.length) {
      return errorResponse(c, { status: 404, error: "Profile not found" });
    }
    infoLog(c, { msg: "Fetched own profile", details: { userId: user.id } });
    return c.json({ ok: true, profile: profile[0], user });
  } catch (err) {
    return errorResponse(c, { status: 500, error: "Failed to fetch profile" });
  }
});

router.get(":userId", requireAuth(), async (c) => {
  const user = c.get("user");
  const userId = c.req.param("userId");
  try {
    const profileRows =
      await sql`SELECT * FROM profiles WHERE user_id = ${userId}`;
    if (!profileRows.length) {
      return errorResponse(c, { status: 404, error: "Profile not found" });
    }
    const userRows =
      await sql`SELECT manager_id FROM users WHERE id = ${userId}`;
    const manager_id = userRows[0]?.manager_id || null;
    let filtered = { ...profileRows[0], manager_id };
    if (user.id !== userId) {
      const isManager = manager_id === user.id;
      if (!isManager) {
        const { phone, address, emergency_contact, salary_sensitive, ...rest } =
          filtered;
        filtered = rest;
      }
    }
    infoLog(c, { msg: "Fetched profile", details: { userId } });
    return c.json({ ok: true, profile: filtered });
  } catch (err) {
    return errorResponse(c, { status: 500, error: "Failed to fetch profile" });
  }
});

export default router;
