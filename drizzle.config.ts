import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/db/schema/index.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        // Direct connection (port 5432) for Drizzle Kit; poolers don't support DDL.
        url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
    },
});
