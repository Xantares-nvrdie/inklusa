import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import actionPlansModule from "@/backend/modules/action-plans";
import adminModule from "@/backend/modules/admin";
import knowledgeModule from "@/backend/modules/knowledge";
import studentsModule from "@/backend/modules/students";
import betterAuthView from "@/backend/utils/better-auth";

export const app = new Elysia({ prefix: "/api" })
    .use(
        openapi({
            path: "/labs",
            documentation: {
                info: {
                    title: "INKLUSA API",
                    version: "0.1.0",
                    description: "See the barrier. Support the learner.",
                },
            },
        }),
    )

    /* AUTH */
    .all("/auth/*", betterAuthView, { detail: { hide: true } })
    /* FEATURE MODULES */
    .use(knowledgeModule)
    .use(studentsModule)
    .use(adminModule)
    .use(actionPlansModule);

export type app = typeof app;

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const PATCH = app.fetch;
export const DELETE = app.fetch;
