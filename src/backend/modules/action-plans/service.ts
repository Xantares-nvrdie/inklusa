import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { actionPlans } from "@/db/schema";

type Plan = typeof actionPlans.$inferInsert;

const ACTIVE = ["PLANNED", "IN_PROGRESS", "NEEDS_REFLECTION"] as const;

export type PlanFilter = "all" | "active" | "completed";

export const ActionPlanService = {
    async list(teacherId: string, filter: PlanFilter = "all") {
        const where =
            filter === "active"
                ? and(eq(actionPlans.teacherId, teacherId), inArray(actionPlans.status, [...ACTIVE]))
                : filter === "completed"
                  ? and(eq(actionPlans.teacherId, teacherId), eq(actionPlans.status, "COMPLETED"))
                  : eq(actionPlans.teacherId, teacherId);

        return db.query.actionPlans.findMany({
            where,
            orderBy: desc(actionPlans.updatedAt),
            with: { student: true },
        });
    },

    async summary(teacherId: string) {
        const rows = await db.select({ status: actionPlans.status }).from(actionPlans).where(eq(actionPlans.teacherId, teacherId));
        return {
            active: rows.filter((r) => r.status !== "COMPLETED").length,
            needsReflection: rows.filter((r) => r.status === "NEEDS_REFLECTION").length,
            completed: rows.filter((r) => r.status === "COMPLETED").length,
        };
    },

    getById(teacherId: string, id: string) {
        return db.query.actionPlans.findFirst({
            where: and(eq(actionPlans.id, id), eq(actionPlans.teacherId, teacherId)),
            with: { student: true },
        });
    },

    async create(teacherId: string, input: Omit<Plan, "id" | "teacherId" | "status">) {
        const [row] = await db
            .insert(actionPlans)
            .values({ ...input, teacherId, status: "PLANNED" })
            .returning();
        return row;
    },

    async setStatus(teacherId: string, id: string, status: "PLANNED" | "IN_PROGRESS" | "NEEDS_REFLECTION") {
        const [row] = await db
            .update(actionPlans)
            .set({ status })
            .where(and(eq(actionPlans.id, id), eq(actionPlans.teacherId, teacherId)))
            .returning();
        return row ?? null;
    },

    async reflect(
        teacherId: string,
        id: string,
        input: { result: "VERY_HELPFUL" | "HELPFUL" | "SOME_CHANGE" | "NOT_HELPFUL"; note?: string },
    ) {
        const [row] = await db
            .update(actionPlans)
            .set({
                reflectionResult: input.result,
                reflectionNote: input.note?.trim() || null,
                reflectedAt: new Date(),
                status: "COMPLETED",
            })
            .where(and(eq(actionPlans.id, id), eq(actionPlans.teacherId, teacherId)))
            .returning();
        return row ?? null;
    },
};
