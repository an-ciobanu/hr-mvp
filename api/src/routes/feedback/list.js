import { sql } from "../../lib/db.js";
import { requireAuth, requireSelfOrManager } from "../../lib/auth.js";
import { errorResponse, infoLog } from "../../lib/error.js";
import { Hono } from "hono";

const router = new Hono();

router.get(":userId", requireAuth(), requireSelfOrManager(), async (c) => {
  const userId = c.req.param("userId");
  try {
    const feedback =
      await sql`SELECT * FROM feedback WHERE target_user_id = ${userId} ORDER BY created_at DESC`;
    infoLog(c, { msg: "Fetched feedback for user", details: { userId } });
    return c.json({ feedback });
  } catch (err) {
    return errorResponse(c, { status: 500, error: "Failed to fetch feedback" });
  }
});

export default router;
