import { z } from "zod";
import { sql } from "../../lib/db.js";
import { errorResponse, infoLog } from "../../lib/error.js";
import { requireAuth, requireSelfOrManager } from "../../lib/auth.js";
import { Hono } from "hono";

const router = new Hono();

const profileSchema = z.object({
  phone: z.string().min(5).max(50),
  address: z.string().min(5).max(255),
  emergency_contact: z.object({
    name: z.string().min(2),
    phone: z.string().min(5),
    relationship: z.string().min(2),
  }),
  bio: z.string().optional(),
  start_date: z.string().optional(),
  salary_sensitive: z.any().optional(),
});

router.post(":userId", requireAuth(), requireSelfOrManager(), async (c) => {
  const user = c.get("user");
  const userId = c.req.param("userId");
  const body = await c.req.json();
  const result = profileSchema.safeParse(body);
  if (!result.success) {
    return errorResponse(c, {
      status: 400,
      error: "Invalid input",
      details: result.error.errors,
    });
  }
  try {
    const exists = await sql`SELECT 1 FROM profiles WHERE user_id = ${userId}`;
    if (exists.length) {
      return errorResponse(c, { status: 400, error: "Profile already exists" });
    }
    const profileData = { ...result.data };
    if (user.role !== "manager") {
      delete profileData.salary_sensitive;
    }
    const inserted = await sql`
      INSERT INTO profiles (user_id, phone, address, emergency_contact, salary_sensitive, bio, start_date)
      VALUES (
        ${userId},
        ${profileData.phone},
        ${profileData.address},
        ${profileData.emergency_contact},
        ${profileData.salary_sensitive || null},
        ${profileData.bio || null},
        ${profileData.start_date || null}
      )
      RETURNING *
    `;
    infoLog(c, { msg: "Created profile", details: { userId } });
    return c.json({ ok: true, profile: inserted[0] });
  } catch (err) {
    return errorResponse(c, { status: 500, error: "Failed to create profile" });
  }
});

export default router;
