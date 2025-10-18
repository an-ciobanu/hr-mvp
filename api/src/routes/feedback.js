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
 * GET /api/feedback/:userId
 * Returns all feedback for a given user (target_user_id)
 */
router.get("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const cookie = c.req.header("Cookie") || "";
  const user = getUserFromCookie(cookie);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  // Check if user is the target or their manager
  const { isEmployeeOrManager } = await import("../lib/utils.js");
  if (!(await isEmployeeOrManager(user, userId))) {
    return c.json({ error: "Forbidden" }, 403);
  }
  try {
    const feedback = await sql`
        SELECT * FROM feedback WHERE target_user_id = ${userId} ORDER BY created_at DESC
      `;
    return c.json({ feedback });
  } catch (err) {
    logger.error("DB error fetching feedback", err);
    return c.json({ error: "Failed to fetch feedback" }, 500);
  }
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
        ${body.body_raw},
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
