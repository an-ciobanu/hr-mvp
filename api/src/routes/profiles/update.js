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

router.put(":userId", requireAuth(), requireSelfOrManager(), async (c) => {
  const user = c.get("user");
  const userId = c.req.param("userId");
  const body = await c.req.json();
  const result = profileSchema.partial().safeParse(body);
  if (!result.success) {
    return errorResponse(c, {
      status: 400,
      error: "Invalid input",
      details: result.error.errors,
    });
  }
  try {
    const profileData = { ...result.data };
    if (user.role !== "manager") {
      delete profileData.salary_sensitive;
    }
    const updated = await sql`
      UPDATE profiles SET
        phone = COALESCE(${profileData.phone || null}, phone),
        address = COALESCE(${profileData.address || null}, address),
        emergency_contact = COALESCE(${
          profileData.emergency_contact || null
        }, emergency_contact),
        salary_sensitive = COALESCE(${
          profileData.salary_sensitive || null
        }, salary_sensitive),
        bio = COALESCE(${profileData.bio || null}, bio),
        start_date = COALESCE(${profileData.start_date || null}, start_date),
        updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `;
    if (!updated.length)
      return errorResponse(c, { status: 404, error: "Profile not found" });
    infoLog(c, { msg: "Updated profile", details: { userId } });
    return c.json({ ok: true, profile: updated[0] });
  } catch (err) {
    return errorResponse(c, { status: 500, error: "Failed to update profile" });
  }
});

export default router;
