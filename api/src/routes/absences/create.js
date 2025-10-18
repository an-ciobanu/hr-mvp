import { z } from "zod";
import { sql } from "../../lib/db.js";
import { errorResponse } from "../../lib/error.js";
import { requireAuth } from "../../lib/auth.js";
import { Hono } from "hono";

const router = new Hono();

const absenceSchema = z.object({
  start_date: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
  end_date: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
  reason: z.string().min(1),
});

router.post("/", requireAuth(), async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const result = absenceSchema.safeParse(body);
  if (!result.success) {
    return errorResponse(c, {
      status: 400,
      error: "Validation failed",
      details: result.error,
    });
  }
  try {
    const { start_date, end_date, reason } = result.data;
    const inserted = await sql`
      INSERT INTO absences (user_id, start_date, end_date, reason, status)
      VALUES (${user.id}, ${start_date}, ${end_date}, ${reason}, 'requested')
      RETURNING *
    `;
    return c.json({ absence: inserted[0] });
  } catch (err) {
    return errorResponse(c, {
      status: 500,
      error: "Failed to create absence",
      details: err.message,
    });
  }
});

export default router;
