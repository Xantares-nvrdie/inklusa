import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const isProd = process.env.NODE_ENV === "production";
const isSupabase = process.env.DATABASE_URL?.includes("supabase.com") ?? false;

const globalForDb = globalThis as unknown as {
    conn: Pool | undefined;
};

const pool =
    globalForDb.conn ??
    new Pool({
        connectionString: process.env.DATABASE_URL!,
        ssl: isProd || isSupabase ? { rejectUnauthorized: false } : undefined,
        max: isProd ? 2 : 10,
        idleTimeoutMillis: 15000,
        connectionTimeoutMillis: 5000,
    });

globalForDb.conn = pool;

pool.on("error", (err: Error) => {
    console.error("Database connection error (idle client):", err.message);
});

export const db = drizzle(pool, { schema });
