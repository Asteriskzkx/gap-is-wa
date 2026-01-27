import { Pool } from "pg";

export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1000, // ปรับตาม server
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});