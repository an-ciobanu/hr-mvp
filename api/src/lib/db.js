import postgres from "postgres";

/**
 * Creates and exports a singleton Postgres client for DB access.
 * Usage: import { sql } from "../lib/db.js";
 */
const databaseUrl =
  process.env.DATABASE_URL || "postgres://hrmvp:hrmvp@localhost:5432/hrmvp";

const sql = postgres(databaseUrl, { prepare: true });

export { sql };
