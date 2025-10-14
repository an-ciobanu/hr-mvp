import { write } from "bun";

const LOG_PATH = "logs/error.log";

/**
 * Writes a structured error log entry to logs/error.log
 * @param {string} message - Short error message
 * @param {object} details - Additional error details (optional)
 */
export async function logError(message, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level: "error",
    message,
    details,
  };
  await write(LOG_PATH, JSON.stringify(entry) + "\n", { append: true });
}
