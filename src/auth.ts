import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "secret-placeholder-change-in-env",
    plugins: [admin({ defaultRole: "TEACHER", adminRoles: ["ADMIN"] })],
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:3001",
        process.env.NEXT_PUBLIC_APP_URL as string,
        process.env.BETTER_AUTH_URL as string,
    ].filter(Boolean),
});
