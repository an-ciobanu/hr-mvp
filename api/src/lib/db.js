import postgres from "postgres";

/**
 * Creates and exports a singleton Postgres client for DB access.
 * Usage: import { sql } from "../lib/db.js";
 */

const sql = postgres(process.env.DATABASE_URL, { prepare: true });

export { sql };
