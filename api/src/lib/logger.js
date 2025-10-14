import { createLogger, format, transports } from "winston";

// Create Winston logger
const logger = createLogger({
  level: "info", // Default log level
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }), // Include stack trace for errors
    format.json()
  ),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: "logs/error.log", level: "error" }), // Error logs
    new transports.File({ filename: "logs/combined.log" }), // All logs
  ],
  exceptionHandlers: [
    new transports.File({ filename: "logs/exceptions.log" }), // Uncaught exceptions
  ],
});

export { logger };
