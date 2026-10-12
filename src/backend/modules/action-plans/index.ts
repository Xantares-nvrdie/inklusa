import { Elysia } from "elysia";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";
import { ActionPlanModel, type PlanFilter } from "./model";
import { ActionPlanService } from "./service";

const NOT_FOUND = { message: "Action plan not found" };
const NOT_OWNED = { message: "Action plan not found or not owned by you" };

const actionPlansModule = new Elysia({ prefix: "/action-plans", tags: ["Action Plans"] })
    .use(betterAuthMiddleware)

    .get(
        "/",
        ({ user, query }) =>
            ActionPlanService.list(
                query.global === "true" ? null : user.id,
                (query.filter ?? "all") as PlanFilter,
                query.student,
            ),
        {
            auth: true,
            query: ActionPlanModel.listQuery,
            detail: { summary: "List interventions (filter: all | active | completed)" },
        },
    )

    .get(
        "/browse",
        ({ user, query }) =>
            ActionPlanService.browse(user.id, {
                filter: (query.filter ?? "all") as PlanFilter,
                page: query.page ? Number(query.page) : 1,
                pageSize: query.pageSize ? Number(query.pageSize) : 10,
                from: query.from,
                to: query.to,
                teacher: query.teacher,
                q: query.q,
            }),
        {
            auth: true,
            query: ActionPlanModel.browseQuery,
            detail: { summary: "Paginated, filterable list of all teachers' plans" },
        },
    )

    .get("/summary", ({ user }) => ActionPlanService.summary(user.id), {
        auth: true,
        detail: { summary: "Dashboard counters" },
    })

    .get("/history", ({ user, query }) => ActionPlanService.history(user.id, query.cat, query.clar, query.student), {
        auth: true,
        query: ActionPlanModel.historyQuery,
        detail: { summary: "Historical reflection stats for a barrier" },
    })

    .get(
        "/:id",
        async ({ user, params, set }) => {
            const row = await ActionPlanService.getById(user.id, params.id);
            if (!row) {
                set.status = 404;
                return NOT_FOUND;
            }
            return row;
        },
        { auth: true, params: ActionPlanModel.params },
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
            body: ActionPlanModel.createBody,
            detail: { summary: "Save an action plan" },
        },
    )

    .patch(
        "/:id/status",
        async ({ user, params, body, set }) => {
            const row = await ActionPlanService.setStatus(user.id, params.id, body.status);
            if (!row) {
                set.status = 404;
                return NOT_FOUND;
            }
            return row;
        },
        { auth: true, params: ActionPlanModel.params, body: ActionPlanModel.statusBody },
    )

    .post(
        "/:id/reflection",
        async ({ user, params, body, set }) => {
            const row = await ActionPlanService.reflect(user.id, params.id, body);
            if (!row) {
                set.status = 404;
                return NOT_FOUND;
            }
            return row;
        },
        {
            auth: true,
            params: ActionPlanModel.params,
            body: ActionPlanModel.reflectionBody,
            detail: { summary: "Save reflection and complete the intervention" },
        },
    )

    .patch(
        "/:id",
        async ({ user, params, body, set }) => {
            const row = await ActionPlanService.update(user.id, params.id, body);
            if (!row) {
                set.status = 404;
                return NOT_OWNED;
            }
            return row;
        },
        {
            auth: true,
            params: ActionPlanModel.params,
            body: ActionPlanModel.updateBody,
            detail: { summary: "Update an action plan (goal, timing, student)" },
        },
    )

    .delete(
        "/:id",
        async ({ user, params, set }) => {
            const row = await ActionPlanService.cancel(user.id, params.id);
            if (!row) {
                set.status = 404;
                return NOT_OWNED;
            }
            return { success: true, message: "Action plan cancelled", plan: row };
        },
        {
            auth: true,
            params: ActionPlanModel.params,
            detail: { summary: "Soft delete (cancel) an action plan" },
        },
    )

    .post(
        "/:id/restore",
        async ({ user, params, set }) => {
            const row = await ActionPlanService.restore(user.id, params.id);
            if (!row) {
                set.status = 404;
                return NOT_OWNED;
            }
            return { success: true, message: "Action plan restored", plan: row };
        },
        {
            auth: true,
            params: ActionPlanModel.params,
            detail: { summary: "Restore a cancelled action plan" },
        },
    );

export default actionPlansModule;
