import { Hono } from "hono";
import { z } from "zod";
import { sql } from "../lib/db.js";
import { getUserFromCookie } from "../lib/jwt.js";
import { logger } from "../lib/logger.js";

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

// RBAC helper: returns true if user is self or manager of target
async function isEmployeeOrManager(user, targetUserId) {
  if (!user) return false;
  if (user.id === targetUserId) return true;
  const res =
    await sql`SELECT manager_id FROM users WHERE id = ${targetUserId}`;
  return res[0] && res[0].manager_id === user.id;
}

/**
 * POST /api/profiles/:userId
 * Manager/employee creates a profile for a specific user
 */
router.post("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const body = await c.req.json();
  const result = profileSchema.safeParse(body);
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

  if (!(await isEmployeeOrManager(user, userId))) {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    const exists = await sql`SELECT 1 FROM profiles WHERE user_id = ${userId}`;
    if (exists.length) {
      return c.json({ error: "Profile already exists" }, 400);
    }

    const profileData = { ...result.data };

    // Only managers can set salary_sensitive
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
    return c.json({ ok: true, profile: inserted[0] });
  } catch (err) {
    logger.error("DB error creating profile", err);
    return c.json({ error: "Failed to create profile" }, 500);
  }
});

/**
 * PUT /api/profiles/userId
 * Manager/employee edits a profile
 */
router.put("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const body = await c.req.json();
  const result = profileSchema.partial().safeParse(body);
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

  if (!(await isEmployeeOrManager(user, userId))) {
    return c.json({ error: "Forbidden" }, 403);
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

    if (!updated.length) return c.json({ error: "Profile not found" }, 404);

    return c.json({ ok: true, profile: updated[0] });
  } catch (err) {
    logger.error("DB error updating profile", err);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

/**
 * GET /api/profiles/:userId
 * Employee or their manager can fetch all profile data for a user
 * coworker only filtered data
 */
router.get("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const cookie = c.req.header("Cookie") || "";
  const user = getUserFromCookie(cookie);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const profile = await sql`SELECT * FROM profiles WHERE user_id = ${userId}`;
    if (!profile.length) {
      return c.json({ error: "Profile not found" }, 404);
    }

    let filtered = profile[0];
    if (user.id !== userId) {
      const res = await sql`SELECT manager_id FROM users WHERE id = ${userId}`;
      const isManager = res[0] && res[0].manager_id === user.id;
      if (!isManager) {
        const { phone, address, emergency_contact, salary_sensitive, ...rest } =
          filtered;
        filtered = rest;
      }
    }
    return c.json({ ok: true, profile: filtered });
  } catch (err) {
    await logger.error("DB error fetching profile", err);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

export default router;
