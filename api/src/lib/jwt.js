import jwt from "jsonwebtoken";

/**
 * Extracts and verifies JWT from Cookie header string.
 * @param {string} cookieHeader - The Cookie header value
 * @returns {object|null} Decoded user or null if invalid
 */
export function getUserFromCookie(cookieHeader) {
  if (!cookieHeader || typeof cookieHeader !== "string") return null;
  const tokenMatch = cookieHeader.match(/token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  return token ? verifyJwt(token) : null;
}

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
