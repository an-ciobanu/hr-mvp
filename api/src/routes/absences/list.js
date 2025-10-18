import { sql } from "../../lib/db.js";
import { errorResponse, infoLog } from "../../lib/error.js";
import { requireAuth, requireSelfOrManager } from "../../lib/auth.js";
import { Hono } from "hono";

const router = new Hono();

router.get(":userId", requireAuth(), requireSelfOrManager(), async (c) => {
  const userId = c.req.param("userId");
  try {
    const absences =
      await sql`SELECT * FROM absences WHERE user_id = ${userId} ORDER BY start_date DESC`;
    infoLog(c, { msg: "Fetched user absences", details: { userId } });
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
