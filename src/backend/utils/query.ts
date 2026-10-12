import { type SQL, sql } from "drizzle-orm";

/** `count(*) FILTER (WHERE cond)` — lets one aggregate query return several conditional counters. */
export const countWhere = (cond: SQL | undefined) => sql<number>`count(*) filter (where ${cond})`.mapWith(Number);
