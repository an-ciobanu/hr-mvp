import jwt from "jsonwebtoken";

/**
 * Signs a JWT for the authenticated user.
 * @param {object} payload - User info to encode in the token.
 * @returns {string} JWT string.
 */
export function signJwt(payload) {
  const secret = process.env.JWT_SECRET;
  // Token expires in 7 days
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

/**
 * Verifies a JWT and returns the decoded payload.
 * @param {string} token - JWT string from cookie.
 * @returns {object|null} Decoded payload or null if invalid.
 */
export function verifyJwt(token) {
  const secret = process.env.JWT_SECRET;
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}
