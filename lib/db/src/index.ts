import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import * as schema from "./schema/index";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!db) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required.");
    }

    pool = new Pool({ connectionString: databaseUrl });
    db = drizzle(pool, { schema });
  }

  return db;
}

export async function closeDb() {
  await pool?.end();
  pool = null;
  db = null;
}

export * from "./schema/index";
