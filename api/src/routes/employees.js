import { z } from "zod";
import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { sql } from "../lib/db.js";
import { logger } from "../lib/logger.js";
import { getUserFromCookie } from "../lib/jwt.js";

const router = new Hono();

const createEmployeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["manager", "employee"]),
  password: z.string().min(8),
  department: z.string().optional(),
});

/**
 * POST /api/employees
 * Manager creates a new employee entity (no profile yet)
 */
router.post("/", async (c) => {
  const body = await c.req.json();
  const result = createEmployeeSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: "Invalid input" }, 400);
  }

  const cookie = c.req.header("Cookie") || "";
  const user = getUserFromCookie(cookie);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  if (user.role !== "manager") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const password_hash = await bcrypt.hash(result.data.password, 10);

  try {
    const inserted = await sql`
    INSERT INTO users (name, email, role, department, manager_id, password_hash)
    VALUES (
      ${result.data.name},
      ${result.data.email},
      ${result.data.role},
      ${result.data.department},
      ${user.id},
      ${password_hash}
    )
    RETURNING id, name, email, role, department, manager_id
  `;
    return c.json({ ok: true, user: inserted[0] });
  } catch (err) {
    if (err.code === "23505") {
      // unique_violation
      logger.error("Email already exists", err);
      return c.json({ error: "Email already exists" }, 400);
    }
    logger.error("DB error creating employee", err);
    return c.json({ error: "Failed to create employee" }, 500);
  }
});

export default router;
