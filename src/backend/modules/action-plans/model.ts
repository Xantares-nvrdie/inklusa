import { t } from "elysia";
import { BarrierCategory, IdParams } from "@/backend/utils/model";
import type { actionPlans } from "@/db/schema";

export const ACTIVE_STATUSES = ["PLANNED", "IN_PROGRESS", "NEEDS_REFLECTION"] as const;
export const HELPFUL_RESULTS = ["VERY_HELPFUL", "HELPFUL"] as const;
export const LIMITED_RESULTS = ["SOME_CHANGE", "NOT_HELPFUL"] as const;

export const ActionPlanModel = {
    params: IdParams,

    listQuery: t.Object({
        filter: t.Optional(t.String()),
        student: t.Optional(t.String()),
        global: t.Optional(t.String()),
    }),

    browseQuery: t.Object({
        filter: t.Optional(t.String()),
        page: t.Optional(t.String()),
        pageSize: t.Optional(t.String()),
        from: t.Optional(t.String()),
        to: t.Optional(t.String()),
        teacher: t.Optional(t.String()),
        q: t.Optional(t.String()),
    }),

    historyQuery: t.Object({
        cat: BarrierCategory,
        clar: t.String(),
        student: t.Optional(t.String()),
    }),

    createBody: t.Object({
        studentId: t.Optional(t.Nullable(t.String())),
        barrierCategory: BarrierCategory,
        clarificationId: t.String(),
        barrierTitle: t.String(),
        interventionSlug: t.String(),
        goal: t.String({ minLength: 1, maxLength: 300 }),
        timing: t.Optional(t.String({ maxLength: 120 })),
    }),

    statusBody: t.Object({
        status: t.Union([t.Literal("PLANNED"), t.Literal("IN_PROGRESS"), t.Literal("NEEDS_REFLECTION")]),
    }),

    reflectionBody: t.Object({
        result: t.Union([
            t.Literal("VERY_HELPFUL"),
            t.Literal("HELPFUL"),
            t.Literal("SOME_CHANGE"),
            t.Literal("NOT_HELPFUL"),
        ]),
        reason: t.Optional(t.String()),
        note: t.Optional(t.String({ maxLength: 1000 })),
    }),

    updateBody: t.Object({
        goal: t.Optional(t.String({ minLength: 1, maxLength: 300 })),
        timing: t.Optional(t.String({ maxLength: 120 })),
        studentId: t.Optional(t.Nullable(t.String())),
    }),
};

export type PlanFilter = "all" | "active" | "completed" | "cancelled";
export type PlanInsert = typeof actionPlans.$inferInsert;
export type PlanCreateInput = Omit<PlanInsert, "id" | "teacherId" | "status">;
export type PlanStatusInput = (typeof ActionPlanModel.statusBody.static)["status"];
export type ReflectionInput = typeof ActionPlanModel.reflectionBody.static;
export type PlanUpdateInput = typeof ActionPlanModel.updateBody.static;
export type BrowseOptions = {
    filter?: PlanFilter;
    page?: number;
    pageSize?: number;
    from?: string;
    to?: string;
    teacher?: string;
    q?: string;
};
