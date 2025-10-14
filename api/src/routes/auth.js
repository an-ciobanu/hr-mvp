import { Hono } from "hono";
import { z } from "zod";
import { signJwt } from "../lib/jwt.js";
import { sql } from "../lib/db.js";
import bcrypt from "bcryptjs";

const router = new Hono();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * POST /api/auth/login
 * Authenticates user and sets HTTP-only cookie if successful.
 */
router.post("/login", async (c) => {
  const body = await c.req.json();
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      { error: "Invalid input", details: result.error.errors },
      400
    );
  }
  const { email, password } = result.data;

  const users = await sql`
    SELECT id, name, email, role, password_hash
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;
  const user = users[0];
  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const jwt = signJwt({ id: user.id, role: user.role, email: user.email });
  c.header("Set-Cookie", [
    `token=${jwt}; HttpOnly; Path=/; SameSite=Strict${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`,
  ]);

  return c.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

export default router;
