import { logger } from "./logger.js";

/**
 * Centralized error response and logging utility
 * @param {object} c - Hono context
 * @param {object} opts - { status, error, details, info }
 * @returns {Promise<Response>}
 */
export async function errorResponse(c, { status = 500, error, details, info }) {
  // Log error with context for traceability
  logger.error({
    msg: error,
    details,
    info,
    path: c.req.path,
    method: c.req.method,
    user: c.var?.user?.id || null,
    timestamp: new Date().toISOString(),
  });
  return c.json({ error, details }, status);
}

/**
 * Centralized info logging utility
 * @param {object} c - Hono context
 * @param {object} opts - { msg, details, info }
 */
export function infoLog(c, { msg, details, info }) {
  logger.info({
    msg,
    details,
    info,
    path: c.req.path,
    method: c.req.method,
    user: c.var?.user?.id || null,
    timestamp: new Date().toISOString(),
  });
}
