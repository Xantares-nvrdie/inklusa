import { Elysia, t } from "elysia";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";
import { KnowledgeService } from "../knowledge/service";
import { AdminService } from "./service";

const Bi = t.Object({ en: t.String({ minLength: 1 }), id: t.String({ minLength: 1 }) });
const Steps = t.Object({
    en: t.Array(t.String({ minLength: 1 }), { minItems: 3, maxItems: 6 }),
    id: t.Array(t.String({ minLength: 1 }), { minItems: 3, maxItems: 6 }),
});
const Category = t.Union([
    t.Literal("INSTRUCTION"),
    t.Literal("READING"),
    t.Literal("FOCUS"),
    t.Literal("EXPRESSION"),
    t.Literal("PARTICIPATION"),
]);
const Slug = t.String({ pattern: "^[a-z0-9]+(-[a-z0-9]+)*$", maxLength: 60 });

const InterventionBody = t.Object({
    category: Category,
    title: Bi,
    summary: Bi,
    why: Bi,
    steps: Steps,
    observe: Bi,
    isActive: t.Optional(t.Boolean()),
});
const ClarificationBody = t.Object({
    category: Category,
    label: Bi,
    barrier: Bi,
    insight: Bi,
    supports: t.Array(t.Object({ slug: t.String(), reason: Bi }), { minItems: 1, maxItems: 5 }),
    isActive: t.Optional(t.Boolean()),
});

const adminModule = new Elysia({ prefix: "/admin", tags: ["Admin"] })
    .use(betterAuthMiddleware)

    // ── Insights ──
    .get("/stats", () => AdminService.stats(), { adminOnly: true, detail: { summary: "Global insights" } })

    // ── Teachers ──
    .get("/teachers", () => AdminService.listTeachers(), { adminOnly: true, detail: { summary: "List teachers" } })
    .post(
        "/teachers",
        async ({ body, set }) => {
            try {
                return await AdminService.createTeacher(body);
            } catch (e) {
                set.status = 400;
                return { message: (e as Error).message || "Could not create teacher" };
            }
        },
        {
            adminOnly: true,
            body: t.Object({
                name: t.String({ minLength: 1, maxLength: 80 }),
                email: t.String({ format: "email" }),
                password: t.String({ minLength: 8, maxLength: 100 }),
            }),
            detail: { summary: "Create a teacher account" },
        },
    )
    .patch(
        "/teachers/:id/ban",
        async ({ params, body, set }) => {
            const row = await AdminService.setBan(params.id, body.banned, body.reason);
            if (!row) {
                set.status = 404;
                return { message: "Teacher not found" };
            }
            return { ok: true };
        },
        {
            adminOnly: true,
            params: t.Object({ id: t.String() }),
            body: t.Object({ banned: t.Boolean(), reason: t.Optional(t.String({ maxLength: 200 })) }),
            detail: { summary: "Ban / unban a teacher" },
        },
    )
    .delete(
        "/teachers/:id",
        async ({ params, set }) => {
            const row = await AdminService.deleteTeacher(params.id);
            if (!row) {
                set.status = 404;
                return { message: "Teacher not found" };
            }
            return { ok: true };
        },
        { adminOnly: true, params: t.Object({ id: t.String() }), detail: { summary: "Delete a teacher and their data" } },
    )

    // ── Knowledge ──
    .post("/knowledge/import-defaults", () => KnowledgeService.importDefaults(), {
        adminOnly: true,
        detail: { summary: "Import built-in knowledge into the database" },
    })

    .get("/knowledge/interventions", () => AdminService.listInterventions(), { adminOnly: true })
    .post(
        "/knowledge/interventions",
        async ({ body, set }) => {
            const { slug, isActive, category, ...rest } = body;
            const row = await AdminService.createIntervention(slug, category, rest, isActive);
            if (!row) {
                set.status = 409;
                return { message: "An intervention with this slug already exists" };
            }
            return row;
        },
        { adminOnly: true, body: t.Composite([t.Object({ slug: Slug }), InterventionBody]) },
    )
    .put(
        "/knowledge/interventions/:slug",
        async ({ params, body, set }) => {
            const { isActive, category, ...rest } = body;
            const row = await AdminService.updateIntervention(params.slug, category, rest, isActive);
            if (!row) {
                set.status = 404;
                return { message: "Not found" };
            }
            return row;
        },
        { adminOnly: true, params: t.Object({ slug: t.String() }), body: InterventionBody },
    )
    .patch(
        "/knowledge/interventions/:slug/active",
        async ({ params, body, set }) => {
            const row = await AdminService.setInterventionActive(params.slug, body.isActive);
            if (!row) {
                set.status = 404;
                return { message: "Not found" };
            }
            return row;
        },
        { adminOnly: true, params: t.Object({ slug: t.String() }), body: t.Object({ isActive: t.Boolean() }) },
    )
    .delete(
        "/knowledge/interventions/:slug",
        async ({ params, set }) => {
            const row = await AdminService.deleteIntervention(params.slug);
            if (!row) {
                set.status = 404;
                return { message: "Not found" };
            }
            return { ok: true };
        },
        { adminOnly: true, params: t.Object({ slug: t.String() }) },
    )

    .get("/knowledge/clarifications", () => AdminService.listClarifications(), { adminOnly: true })
    .post(
        "/knowledge/clarifications",
        async ({ body, set }) => {
            const { id, isActive, category, ...rest } = body;
            const row = await AdminService.createClarification(id, category, rest, isActive);
            if (!row) {
                set.status = 409;
                return { message: "A clarification with this id already exists" };
            }
            return row;
        },
        { adminOnly: true, body: t.Composite([t.Object({ id: Slug }), ClarificationBody]) },
    )
    .put(
        "/knowledge/clarifications/:id",
        async ({ params, body, set }) => {
            const { isActive, category, ...rest } = body;
            const row = await AdminService.updateClarification(params.id, category, rest, isActive);
            if (!row) {
                set.status = 404;
                return { message: "Not found" };
            }
            return row;
        },
        { adminOnly: true, params: t.Object({ id: t.String() }), body: ClarificationBody },
    )
    .patch(
        "/knowledge/clarifications/:id/active",
        async ({ params, body, set }) => {
            const row = await AdminService.setClarificationActive(params.id, body.isActive);
            if (!row) {
                set.status = 404;
                return { message: "Not found" };
            }
            return row;
        },
        { adminOnly: true, params: t.Object({ id: t.String() }), body: t.Object({ isActive: t.Boolean() }) },
    )
    .delete(
        "/knowledge/clarifications/:id",
        async ({ params, set }) => {
            const row = await AdminService.deleteClarification(params.id);
            if (!row) {
                set.status = 404;
                return { message: "Not found" };
            }
            return { ok: true };
        },
        { adminOnly: true, params: t.Object({ id: t.String() }) },
    );

export default adminModule;
