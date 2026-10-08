import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { actionPlans } from "@/db/schema";

type Plan = typeof actionPlans.$inferInsert;

const ACTIVE = ["PLANNED", "IN_PROGRESS", "NEEDS_REFLECTION"] as const;

export type PlanFilter = "all" | "active" | "completed";

export const ActionPlanService = {
    async list(teacherId: string, filter: PlanFilter = "all", studentId?: string) {
        const filters = [eq(actionPlans.teacherId, teacherId)];

        if (filter === "active") {
            filters.push(inArray(actionPlans.status, [...ACTIVE]));
        } else if (filter === "completed") {
            filters.push(eq(actionPlans.status, "COMPLETED"));
        }

        if (studentId) {
            filters.push(eq(actionPlans.studentId, studentId));
        }

        return db.query.actionPlans.findMany({
            where: and(...filters),
            orderBy: desc(actionPlans.updatedAt),
            with: { student: true },
        });
    },

    async summary(teacherId: string) {
        const rows = await db
            .select({ status: actionPlans.status })
            .from(actionPlans)
            .where(eq(actionPlans.teacherId, teacherId));
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

    async history(
        teacherId: string,
        barrierCategory: "INSTRUCTION" | "READING" | "FOCUS" | "EXPRESSION" | "PARTICIPATION",
        clarificationId: string,
        studentId?: string | null,
    ) {
        const filters = [
            eq(actionPlans.teacherId, teacherId),
            eq(actionPlans.barrierCategory, barrierCategory),
            eq(actionPlans.clarificationId, clarificationId),
            eq(actionPlans.status, "COMPLETED"),
        ];
        if (studentId && studentId !== "general") {
            filters.push(eq(actionPlans.studentId, studentId));
        } else if (studentId === "general") {
            // In DB, general classroom is saved as null
            filters.push(isNull(actionPlans.studentId));
        }

        // We can do it by querying all and reducing, since it's limited per teacher per barrier
        const rows = await db
            .select({
                slug: actionPlans.interventionSlug,
                result: actionPlans.reflectionResult,
            })
            .from(actionPlans)
            .where(and(...filters));

        const stats: Record<string, { helpful: number; limited: number }> = {};
        for (const r of rows) {
            if (!stats[r.slug]) stats[r.slug] = { helpful: 0, limited: 0 };
            if (r.result === "VERY_HELPFUL" || r.result === "HELPFUL") {
                stats[r.slug].helpful++;
            } else if (r.result) {
                stats[r.slug].limited++;
            }
        }
        return stats;
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
        input: { result: "VERY_HELPFUL" | "HELPFUL" | "SOME_CHANGE" | "NOT_HELPFUL"; reason?: string; note?: string },
    ) {
        const [row] = await db
            .update(actionPlans)
            .set({
                reflectionResult: input.result,
                reflectionReason: input.reason || null,
                reflectionNote: input.note?.trim() || null,
                reflectedAt: new Date(),
                status: "COMPLETED",
            })
            .where(and(eq(actionPlans.id, id), eq(actionPlans.teacherId, teacherId)))
            .returning();
        return row ?? null;
    },
};
