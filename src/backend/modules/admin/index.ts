import { Elysia } from "elysia";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";
import { KnowledgeService } from "../knowledge/service";
import { AdminModel } from "./model";
import { AdminService } from "./service";

const NOT_FOUND = { message: "Not found" };
const TEACHER_NOT_FOUND = { message: "Teacher not found" };

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
        { adminOnly: true, body: AdminModel.createTeacherBody, detail: { summary: "Create a teacher account" } },
    )
    .patch(
        "/teachers/:id/ban",
        async ({ params, body, set }) => {
            const row = await AdminService.setBan(params.id, body.banned, body.reason);
            if (!row) {
                set.status = 404;
                return TEACHER_NOT_FOUND;
            }
            return { ok: true };
        },
        {
            adminOnly: true,
            params: AdminModel.idParams,
            body: AdminModel.banBody,
            detail: { summary: "Ban / unban a teacher" },
        },
    )
    .delete(
        "/teachers/:id",
        async ({ params, set }) => {
            const row = await AdminService.deleteTeacher(params.id);
            if (!row) {
                set.status = 404;
                return TEACHER_NOT_FOUND;
            }
            return { ok: true };
        },
        { adminOnly: true, params: AdminModel.idParams, detail: { summary: "Delete a teacher and their data" } },
    )

    // ── Knowledge ──
    .post("/knowledge/import-defaults", () => KnowledgeService.importDefaults(), {
        adminOnly: true,
        detail: { summary: "Import built-in knowledge into the database" },
    })

    // Interventions
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
        { adminOnly: true, body: AdminModel.createInterventionBody },
    )
    .put(
        "/knowledge/interventions/:slug",
        async ({ params, body, set }) => {
            const { isActive, category, ...rest } = body;
            const row = await AdminService.updateIntervention(params.slug, category, rest, isActive);
            if (!row) {
                set.status = 404;
                return NOT_FOUND;
            }
            return row;
        },
        { adminOnly: true, params: AdminModel.slugParams, body: AdminModel.interventionBody },
    )
    .patch(
        "/knowledge/interventions/:slug/active",
        async ({ params, body, set }) => {
            const row = await AdminService.setInterventionActive(params.slug, body.isActive);
            if (!row) {
                set.status = 404;
                return NOT_FOUND;
            }
            return row;
        },
        { adminOnly: true, params: AdminModel.slugParams, body: AdminModel.activeBody },
    )
    .delete(
        "/knowledge/interventions/:slug",
        async ({ params, set }) => {
            const row = await AdminService.deleteIntervention(params.slug);
            if (!row) {
                set.status = 404;
                return NOT_FOUND;
            }
            return { ok: true };
        },
        { adminOnly: true, params: AdminModel.slugParams },
    )
    .get(
        "/knowledge/interventions/:slug/feedback",
        ({ params }) => AdminService.getStrategyFeedbackHistory(params.slug),
        {
            adminOnly: true,
            params: AdminModel.slugParams,
            detail: { summary: "Feedback history for a strategy" },
        },
    )

    // Clarifications
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
        { adminOnly: true, body: AdminModel.createClarificationBody },
    )
    .put(
        "/knowledge/clarifications/:id",
        async ({ params, body, set }) => {
            const { isActive, category, ...rest } = body;
            const row = await AdminService.updateClarification(params.id, category, rest, isActive);
            if (!row) {
                set.status = 404;
                return NOT_FOUND;
            }
            return row;
        },
        { adminOnly: true, params: AdminModel.idParams, body: AdminModel.clarificationBody },
    )
    .patch(
        "/knowledge/clarifications/:id/active",
        async ({ params, body, set }) => {
            const row = await AdminService.setClarificationActive(params.id, body.isActive);
            if (!row) {
                set.status = 404;
                return NOT_FOUND;
            }
            return row;
        },
        { adminOnly: true, params: AdminModel.idParams, body: AdminModel.activeBody },
    )
    .delete(
        "/knowledge/clarifications/:id",
        async ({ params, set }) => {
            const row = await AdminService.deleteClarification(params.id);
            if (!row) {
                set.status = 404;
                return NOT_FOUND;
            }
            return { ok: true };
        },
        { adminOnly: true, params: AdminModel.idParams },
    );

export default adminModule;
