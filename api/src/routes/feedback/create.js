import { z } from "zod";
import { sql } from "../../lib/db.js";
import { requireAuth, requireSelfOrManager } from "../../lib/auth.js";
import { errorResponse, infoLog } from "../../lib/error.js";
import { Hono } from "hono";

const router = new Hono();

const feedbackSchema = z.object({
  body_raw: z.string().min(5),
});

router.post(":userId", requireAuth(), async (c) => {
  const user = c.get("user");
  const userId = c.req.param("userId");
  const body = await c.req.json();
  const result = feedbackSchema.safeParse(body);
  if (!result.success) {
    return errorResponse(c, {
      status: 400,
      error: "Invalid input",
      details: result.error.errors,
    });
  }
  if (user.id === userId) {
    return errorResponse(c, {
      status: 400,
      error: "Cannot leave feedback for self",
    });
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
    infoLog(c, {
      msg: "Created feedback",
      details: { userId, author: user.id },
    });
    return c.json({ ok: true, feedback: inserted[0] });
  } catch (err) {
    return errorResponse(c, {
      status: 500,
      error: "Failed to create feedback",
    });
  }
});

export default router;
