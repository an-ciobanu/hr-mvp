import { z } from "zod";
import { sql } from "../../lib/db.js";
import { errorResponse, infoLog } from "../../lib/error.js";
import { requireAuth } from "../../lib/auth.js";
import { ensureRole } from "../../lib/utils.js";
import { Hono } from "hono";

const router = new Hono();

router.patch(":id", requireAuth(), ensureRole("manager"), async (c) => {
  const user = c.get("user");
  const absenceId = c.req.param("id");
  const body = await c.req.json();
  const statusSchema = z.object({ status: z.enum(["approved", "rejected"]) });
  const result = statusSchema.safeParse(body);
  if (!result.success) {
    return errorResponse(c, {
      status: 400,
      error: "Validation failed",
      details: result.error,
    });
  }
  const absences = await sql`
    SELECT a.*, u.manager_id FROM absences a JOIN users u ON a.user_id = u.id WHERE a.id = ${absenceId}
  `;
  if (!absences.length) {
    return errorResponse(c, { status: 404, error: "Absence not found" });
  }
  const absence = absences[0];
  if (absence.manager_id !== user.id) {
    return errorResponse(c, {
      status: 403,
      error: "Forbidden: not direct manager",
    });
  }
  try {
    const updated = await sql`
      UPDATE absences SET status = ${result.data.status}, updated_at = NOW() WHERE id = ${absenceId} RETURNING *
    `;
    infoLog(c, {
      msg: "Absence status updated",
      details: { absenceId, status: result.data.status },
    });
    return c.json({ absence: updated[0] });
  } catch (err) {
    return errorResponse(c, {
      status: 500,
      error: "Failed to update absence",
      details: err.message,
    });
  }
});

export default router;
