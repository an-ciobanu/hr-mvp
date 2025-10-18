import { sql } from "../../lib/db.js";
import { errorResponse, infoLog } from "../../lib/error.js";
import { requireAuth } from "../../lib/auth.js";
import { Hono } from "hono";

const router = new Hono();

router.get("/", requireAuth(), async (c) => {
  try {
    const users = await sql`
      SELECT id, name, email, role, department FROM users ORDER BY name ASC
    `;
    infoLog(c, { msg: "Fetched all users", details: { count: users.length } });
    return c.json({ users });
  } catch (err) {
    return errorResponse(c, {
      status: 500,
      error: "Failed to fetch users",
    });
  }
});

export default router;
