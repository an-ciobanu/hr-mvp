import { z } from "zod";
import bcrypt from "bcryptjs";
import { sql } from "../../lib/db.js";
import { errorResponse, infoLog } from "../../lib/error.js";
import { requireAuth } from "../../lib/auth.js";
import { ensureRole } from "../../lib/utils.js";
import { Hono } from "hono";

const router = new Hono();

const createEmployeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["manager", "employee"]),
  password: z.string().min(8),
  department: z.string().optional(),
});

router.post("/", requireAuth(), ensureRole("manager"), async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const result = createEmployeeSchema.safeParse(body);
  if (!result.success) {
    return errorResponse(c, { status: 400, error: "Invalid input" });
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
    infoLog(c, {
      msg: "Created employee",
      details: { userId: inserted[0].id },
    });
    return c.json({ ok: true, user: inserted[0] });
  } catch (err) {
    if (err.code === "23505") {
      // unique_violation
      return errorResponse(c, { status: 400, error: "Email already exists" });
    }
    return errorResponse(c, {
      status: 500,
      error: "Failed to create employee",
    });
  }
});

export default router;
