import { sql } from "../../lib/db.js";
import { errorResponse, infoLog } from "../../lib/error.js";
import { requireAuth } from "../../lib/auth.js";
import { ensureRole } from "../../lib/utils.js";
import { Hono } from "hono";

const router = new Hono();

router.get("/manager", requireAuth(), ensureRole("manager"), async (c) => {
  const user = c.get("user");
  try {
    const absences = await sql`
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM absences a
      JOIN users u ON a.user_id = u.id
      WHERE u.manager_id = ${user.id} AND a.status = 'requested'
      ORDER BY a.start_date DESC
    `;
    infoLog(c, {
      msg: "Fetched manager absences",
      details: { count: absences.length },
    });
    return c.json({ absences });
  } catch (err) {
    return errorResponse(c, {
      status: 500,
      error: "Failed to fetch absences",
      details: err.message,
    });
  }
});

export default router;
