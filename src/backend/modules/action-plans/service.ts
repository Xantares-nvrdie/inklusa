import { and, count, desc, eq, gte, ilike, inArray, isNull, lt } from "drizzle-orm";
import { db } from "@/db";
import { actionPlans, students, user } from "@/db/schema";

type Plan = typeof actionPlans.$inferInsert;

const ACTIVE = ["PLANNED", "IN_PROGRESS", "NEEDS_REFLECTION"] as const;

export type PlanFilter = "all" | "active" | "completed";

export const ActionPlanService = {
    async list(teacherId: string | null, filter: PlanFilter = "all", studentId?: string) {
        const filters = [];
        if (teacherId) {
            filters.push(eq(actionPlans.teacherId, teacherId));
        }

        if (filter === "active") {
            filters.push(inArray(actionPlans.status, [...ACTIVE]));
        } else if (filter === "completed") {
            filters.push(eq(actionPlans.status, "COMPLETED"));
        }

        if (studentId) {
            filters.push(eq(actionPlans.studentId, studentId));
        }

        return db.query.actionPlans.findMany({
            where: filters.length > 0 ? and(...filters) : undefined,
            orderBy: desc(actionPlans.updatedAt),
            with: { student: true, teacher: true },
        }).then(plans => plans.map(p => ({ ...p, teacherName: p.teacher?.name ?? "Unknown" })));
    },

    async browse(
        viewerId: string,
        opts: {
            filter?: PlanFilter;
            page?: number;
            pageSize?: number;
            from?: string;
            to?: string;
            teacher?: string;
            q?: string;
        },
    ) {
        const pageSize = Math.min(Math.max(opts.pageSize ?? 10, 1), 50);
        const page = Math.max(opts.page ?? 1, 1);
        const filters = [];

        if (opts.filter === "active") filters.push(inArray(actionPlans.status, [...ACTIVE]));
        else if (opts.filter === "completed") filters.push(eq(actionPlans.status, "COMPLETED"));

        if (opts.teacher) filters.push(eq(actionPlans.teacherId, opts.teacher));

        const from = opts.from ? new Date(`${opts.from}T00:00:00`) : null;
        if (from && !Number.isNaN(from.getTime())) filters.push(gte(actionPlans.createdAt, from));
        const to = opts.to ? new Date(`${opts.to}T00:00:00`) : null;
        if (to && !Number.isNaN(to.getTime())) {
            to.setDate(to.getDate() + 1);
            filters.push(lt(actionPlans.createdAt, to));
        }

        const q = opts.q?.trim().replace(/[%_\\]/g, (c) => `\\${c}`);
        if (q) {
            filters.push(
                inArray(actionPlans.studentId, db.select({ id: students.id }).from(students).where(ilike(students.name, `%${q}%`))),
            );
        }

        const where = filters.length > 0 ? and(...filters) : undefined;

        const [{ total }] = await db.select({ total: count() }).from(actionPlans).where(where);
        const rows = await db.query.actionPlans.findMany({
            where,
            orderBy: desc(actionPlans.createdAt),
            limit: pageSize,
            offset: (page - 1) * pageSize,
            with: { student: true, teacher: true },
        });

        const teacherRows = await db
            .selectDistinct({ id: user.id, name: user.name })
            .from(actionPlans)
            .innerJoin(user, eq(user.id, actionPlans.teacherId));

        return {
            items: rows.map(({ teacher, ...p }) => {
                const isOwner = p.teacherId === viewerId;
                return {
                    ...p,
                    ...(isOwner ? {} : { reflectionNote: null, reflectionReason: null }),
                    teacherName: teacher?.name ?? "Unknown",
                    isOwner,
                };
            }),
            total,
            page,
            pageSize,
            teachers: teacherRows.sort((a, b) => a.name.localeCompare(b.name)),
        };
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
