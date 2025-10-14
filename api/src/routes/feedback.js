import { Hono } from "hono";
import { z } from "zod";
import { sql } from "../lib/db.js";
import { getUserFromCookie } from "../lib/jwt.js";
import { logger } from "../lib/logger.js";

const router = new Hono();

const feedbackSchema = z.object({
  body_raw: z.string().min(5),
});

/**
 * POST /api/feedback
 * Coworker/manager leaves feedback for an employee
 */
router.post("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const body = await c.req.json();
  const result = feedbackSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      { error: "Invalid input", details: result.error.errors },
      400
    );
  }
  const cookie = c.req.header("Cookie") || "";
  const user = getUserFromCookie(cookie);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  // Prevent self-feedback
  if (user.id === userId) {
    return c.json({ error: "Cannot leave feedback for self" }, 400);
  }
  try {
    const inserted = await sql`
      INSERT INTO feedback (target_user_id, author_user_id, body_raw, created_at)
      VALUES (
        ${userId},
        ${user.id},
        ${body.body_raw}
        NOW()
      )
      RETURNING *
    `;
    return c.json({ ok: true, feedback: inserted[0] });
  } catch (err) {
    logger.error("DB error creating feedback", err);
    return c.json({ error: "Failed to create feedback" }, 500);
  }
});

export default router;
