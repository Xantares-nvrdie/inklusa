import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";

const secret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET;
if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("BETTER_AUTH_SECRET is required in production");
}

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    secret: secret || "secret-placeholder-change-in-env",
    plugins: [admin({ defaultRole: "TEACHER", adminRoles: ["ADMIN"] })],
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
    },
    baseURL:
        process.env.BETTER_AUTH_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
            : undefined),
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:3001",
        process.env.NEXT_PUBLIC_APP_URL as string,
        process.env.BETTER_AUTH_URL as string,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
        process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "",
    ].filter(Boolean),
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    if (user.banned === false) {
                        return {
                            data: {
                                ...user,
                                banned: false,
                                banReason: null,
                            },
                        };
                    }
                    return {
                        data: {
                            ...user,
                            banned: true,
                            banReason: "PENDING_APPROVAL",
                        },
                    };
                },
            },
        },
    },
});
