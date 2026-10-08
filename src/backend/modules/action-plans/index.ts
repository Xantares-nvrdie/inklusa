import { Elysia, t } from "elysia";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";
import { ActionPlanService, type PlanFilter } from "./service";

const CATEGORIES = t.Union([
    t.Literal("INSTRUCTION"),
    t.Literal("READING"),
    t.Literal("FOCUS"),
    t.Literal("EXPRESSION"),
    t.Literal("PARTICIPATION"),
]);

const actionPlansModule = new Elysia({ prefix: "/action-plans", tags: ["Action Plans"] })
    .use(betterAuthMiddleware)

    .get(
        "/",
        ({ user, query }) => ActionPlanService.list(query.global === "true" ? null : user.id, (query.filter ?? "all") as PlanFilter, query.student),
        {
            auth: true,
            query: t.Object({
                filter: t.Optional(t.String()),
                student: t.Optional(t.String()),
                global: t.Optional(t.String()),
            }),
            detail: { summary: "List interventions (filter: all | active | completed)" },
        },
    )

    .get("/summary", ({ user }) => ActionPlanService.summary(user.id), {
        auth: true,
        detail: { summary: "Dashboard counters" },
    })

    .get(
        "/history",
        ({ user, query }) => ActionPlanService.history(user.id, query.cat as any, query.clar, query.student),
        {
            auth: true,
            query: t.Object({
                cat: t.String(),
                clar: t.String(),
                student: t.Optional(t.String()),
            }),
            detail: { summary: "Historical reflection stats for a barrier" },
        },
    )

    .get(
        "/:id",
        async ({ user, params, set }) => {
            const row = await ActionPlanService.getById(user.id, params.id);
            if (!row) {
                set.status = 404;
                return { message: "Action plan not found" };
            }
            return row;
        },
        { auth: true, params: t.Object({ id: t.String() }) },
    )

    .post(
        "/",
        ({ user, body }) =>
            ActionPlanService.create(user.id, {
                studentId: body.studentId ?? null,
                barrierCategory: body.barrierCategory,
                clarificationId: body.clarificationId,
                barrierTitle: body.barrierTitle,
                interventionSlug: body.interventionSlug,
                goal: body.goal,
                timing: body.timing ?? "Next activity",
            }),
        {
            auth: true,
            body: t.Object({
                studentId: t.Optional(t.Nullable(t.String())),
                barrierCategory: CATEGORIES,
                clarificationId: t.String(),
                barrierTitle: t.String(),
                interventionSlug: t.String(),
                goal: t.String({ minLength: 1, maxLength: 300 }),
                timing: t.Optional(t.String({ maxLength: 120 })),
            }),
            detail: { summary: "Save an action plan" },
        },
    )

    .patch(
        "/:id/status",
        async ({ user, params, body, set }) => {
            const row = await ActionPlanService.setStatus(user.id, params.id, body.status);
            if (!row) {
                set.status = 404;
                return { message: "Action plan not found" };
            }
            return row;
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: t.Object({
                status: t.Union([t.Literal("PLANNED"), t.Literal("IN_PROGRESS"), t.Literal("NEEDS_REFLECTION")]),
            }),
        },
    )

    .post(
        "/:id/reflection",
        async ({ user, params, body, set }) => {
            const row = await ActionPlanService.reflect(user.id, params.id, body);
            if (!row) {
                set.status = 404;
                return { message: "Action plan not found" };
            }
            return row;
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: t.Object({
                result: t.Union([
                    t.Literal("VERY_HELPFUL"),
                    t.Literal("HELPFUL"),
                    t.Literal("SOME_CHANGE"),
                    t.Literal("NOT_HELPFUL"),
                ]),
                reason: t.Optional(t.String()),
                note: t.Optional(t.String({ maxLength: 1000 })),
            }),
            detail: { summary: "Save reflection and complete the intervention" },
        },
    );

export default actionPlansModule;
