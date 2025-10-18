// Absence routes for HR MVP
import { z } from "zod";
import { Hono } from "hono";
import { sql } from "../lib/db.js";
import { logger } from "../lib/logger.js";
import { getUserFromCookie } from "../lib/jwt.js";
import { isEmployeeOrManager, ensureRole } from "../lib/utils.js";

// Zod schema for absence creation
const absenceSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(1),
});

const router = new Hono();

/**
 * POST /api/absences
 * Employee creates an absence request for self
 */
router.post("/", async (c) => {
  const cookie = c.req.header("Cookie") || "";
  const user = getUserFromCookie(cookie);
  const body = await c.req.json();
  const result = absenceSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: "Validation failed", details: result.error }, 400);
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
    logger.error("Failed to create absence", err);
    return c.json(
      { error: "Failed to create absence", details: err.message },
      500
    );
  }
});
/**
 * GET /api/absences/manager
 * Returns all pending absences (status = 'requested') for direct reports of the logged-in manager
 * Only the manager can view their direct reports' pending absences
 */
router.get("/manager", async (c) => {
  const cookie = c.req.header("Cookie") || "";
  const user = getUserFromCookie(cookie);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  if (user.role !== "manager") {
    return c.json({ error: "Forbidden" }, 403);
  }
  try {
    const absences = await sql`
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM absences a
      JOIN users u ON a.user_id = u.id
      WHERE u.manager_id = ${user.id} AND a.status = 'requested'
      ORDER BY a.start_date DESC
    `;
    return c.json({ absences });
  } catch (err) {
    logger.error("Failed to fetch manager absences", err);
    return c.json(
      { error: "Failed to fetch absences", details: err.message },
      500
    );
  }
});

/**
 * GET /api/absences/:userId
 * Returns all absences for a given employee (any status)
 * Only the employee or their manager can view
 */
router.get("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const cookie = c.req.header("Cookie") || "";
  const user = getUserFromCookie(cookie);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  if (!(await isEmployeeOrManager(user, userId))) {
    return c.json({ error: "Forbidden" }, 403);
  }
  try {
    const absences = await sql`
        SELECT * FROM absences WHERE user_id = ${userId} ORDER BY start_date DESC
      `;
    return c.json({ absences });
  } catch (err) {
    logger.error("Failed to fetch absences", err);
    return c.json(
      { error: "Failed to fetch absences", details: err.message },
      500
    );
  }
});
/**
 * PATCH /api/absences/:id
 * Manager approves or denies an absence request for their direct report
 * Body: { status: 'approved' | 'rejected' }
 */
router.patch("/:id", ensureRole("manager"), async (c) => {
  const cookie = c.req.header("Cookie") || "";
  const user = getUserFromCookie(cookie);
  const absenceId = c.req.param("id");
  const body = await c.req.json();
  const statusSchema = z.object({ status: z.enum(["approved", "rejected"]) });
  const result = statusSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: "Validation failed", details: result.error }, 400);
  }
  // Find absence and check if user is direct manager
  const absences = await sql`
      SELECT a.*, u.manager_id FROM absences a JOIN users u ON a.user_id = u.id WHERE a.id = ${absenceId}
    `;
  if (!absences.length) {
    return c.json({ error: "Absence not found" }, 404);
  }
  const absence = absences[0];
  if (absence.manager_id !== user.id) {
    return c.json({ error: "Forbidden: not direct manager" }, 403);
  }
  try {
    const updated = await sql`
        UPDATE absences SET status = ${result.data.status}, updated_at = NOW() WHERE id = ${absenceId} RETURNING *
      `;
    return c.json({ absence: updated[0] });
  } catch (err) {
    logger.error("Failed to update absence", err);
    return c.json(
      { error: "Failed to update absence", details: err.message },
      500
    );
  }
});

/**
 * GET /api/absences/manager
 * Returns all pending absences (status = 'requested') for direct reports of the logged-in manager
 * Only the manager can view their direct reports' pending absences
 */
router.get("/manager", async (c) => {
  console.log(c.req.header("Cookie"));
  const cookie = c.req.header("Cookie") || "";
  const user = getUserFromCookie(cookie);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  if (user.role !== "manager") {
    return c.json({ error: "Forbidden" }, 403);
  }
  try {
    const absences = await sql`
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM absences a
      JOIN users u ON a.user_id = u.id
      WHERE u.manager_id = ${user.id} AND a.status = 'requested'
      ORDER BY a.start_date DESC
    `;
    return c.json({ absences });
  } catch (err) {
    logger.error("Failed to fetch manager absences", err);
    return c.json(
      { error: "Failed to fetch absences", details: err.message },
      500
    );
  }
});

export default router;
