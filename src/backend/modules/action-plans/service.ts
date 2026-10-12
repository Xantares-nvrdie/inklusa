import { and, count, desc, eq, exists, gte, ilike, inArray, isNull, lt, type SQL, sql } from "drizzle-orm";
import type { BarrierCategory } from "@/backend/utils/model";
import { countWhere } from "@/backend/utils/query";
import { db } from "@/db";
import { actionPlans, students, user } from "@/db/schema";
import {
    ACTIVE_STATUSES,
    type BrowseOptions,
    HELPFUL_RESULTS,
    LIMITED_RESULTS,
    type PlanCreateInput,
    type PlanFilter,
    type PlanInsert,
    type PlanStatusInput,
    type PlanUpdateInput,
    type ReflectionInput,
} from "./model";

/** Only the teacher's display name is exposed — never the full user row (email, ban info, role). */
const WITH_RELATIONS = { student: true, teacher: { columns: { name: true } } } as const;

const statusFilter = (filter?: PlanFilter): SQL | undefined => {
    if (filter === "active") return inArray(actionPlans.status, [...ACTIVE_STATUSES]);
    if (filter === "completed") return eq(actionPlans.status, "COMPLETED");
    if (filter === "cancelled") return eq(actionPlans.status, "CANCELLED");
    return undefined;
};

const owned = (teacherId: string, id: string) => and(eq(actionPlans.id, id), eq(actionPlans.teacherId, teacherId));

/** Parses a `YYYY-MM-DD` string into a local-midnight Date, or null if invalid. */
const parseDay = (value?: string) => {
    if (!value) return null;
    const d = new Date(`${value}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
};

const escapeLike = (value: string) => value.replace(/[%_\\]/g, (c) => `\\${c}`);

async function updateOwned(teacherId: string, id: string, values: Partial<PlanInsert>) {
    const [row] = await db.update(actionPlans).set(values).where(owned(teacherId, id)).returning();
    return row ?? null;
}

export const ActionPlanService = {
    async list(teacherId: string | null, filter: PlanFilter = "all", studentId?: string) {
        const where = and(
            teacherId ? eq(actionPlans.teacherId, teacherId) : undefined,
            statusFilter(filter),
            studentId ? eq(actionPlans.studentId, studentId) : undefined,
        );

        const plans = await db.query.actionPlans.findMany({
            where,
            orderBy: desc(actionPlans.updatedAt),
            with: WITH_RELATIONS,
        });
        return plans.map(({ teacher, ...p }) => ({ ...p, teacherName: teacher?.name ?? "Unknown" }));
    },

    async browse(viewerId: string, opts: BrowseOptions) {
        const pageSize = Math.min(Math.max(opts.pageSize || 10, 1), 50);
        const page = Math.max(opts.page || 1, 1);

        const from = parseDay(opts.from);
        const to = parseDay(opts.to);
        to?.setDate(to.getDate() + 1); // inclusive end date

        const q = opts.q?.trim();
        const where = and(
            statusFilter(opts.filter),
            opts.teacher ? eq(actionPlans.teacherId, opts.teacher) : undefined,
            from ? gte(actionPlans.createdAt, from) : undefined,
            to ? lt(actionPlans.createdAt, to) : undefined,
            q
                ? inArray(
                      actionPlans.studentId,
                      db
                          .select({ id: students.id })
                          .from(students)
                          .where(ilike(students.name, `%${escapeLike(q)}%`)),
                  )
                : undefined,
        );

        // Independent queries → run concurrently instead of one after another.
        const [[{ total }], rows, teacherRows] = await Promise.all([
            db.select({ total: count() }).from(actionPlans).where(where),
            db.query.actionPlans.findMany({
                where,
                orderBy: desc(actionPlans.createdAt),
                limit: pageSize,
                offset: (page - 1) * pageSize,
                with: WITH_RELATIONS,
            }),
            // Teachers that own at least one plan (EXISTS uses the teacher_id index, no DISTINCT over all plans).
            db
                .select({ id: user.id, name: user.name })
                .from(user)
                .where(exists(db.select({ one: sql`1` }).from(actionPlans).where(eq(actionPlans.teacherId, user.id)))),
        ]);

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

    /** Dashboard counters, aggregated in a single query instead of loading every plan. */
    async summary(teacherId: string) {
        const [row] = await db
            .select({
                active: countWhere(inArray(actionPlans.status, [...ACTIVE_STATUSES])),
                needsReflection: countWhere(eq(actionPlans.status, "NEEDS_REFLECTION")),
                completed: countWhere(eq(actionPlans.status, "COMPLETED")),
                cancelled: countWhere(eq(actionPlans.status, "CANCELLED")),
            })
            .from(actionPlans)
            .where(eq(actionPlans.teacherId, teacherId));
        return row;
    },

    getById(teacherId: string, id: string) {
        return db.query.actionPlans.findFirst({
            where: owned(teacherId, id),
            with: { student: true },
        });
    },

    /** Per-strategy reflection outcomes for a barrier, aggregated in SQL. */
    async history(
        teacherId: string,
        barrierCategory: BarrierCategory,
        clarificationId: string,
        studentId?: string | null,
    ) {
        const rows = await db
            .select({
                slug: actionPlans.interventionSlug,
                helpful: countWhere(inArray(actionPlans.reflectionResult, [...HELPFUL_RESULTS])),
                limited: countWhere(inArray(actionPlans.reflectionResult, [...LIMITED_RESULTS])),
            })
            .from(actionPlans)
            .where(
                and(
                    eq(actionPlans.teacherId, teacherId),
                    eq(actionPlans.barrierCategory, barrierCategory),
                    eq(actionPlans.clarificationId, clarificationId),
                    eq(actionPlans.status, "COMPLETED"),
                    // "general" = classroom-level plans, stored with a null student
                    studentId === "general"
                        ? isNull(actionPlans.studentId)
                        : studentId
                          ? eq(actionPlans.studentId, studentId)
                          : undefined,
                ),
            )
            .groupBy(actionPlans.interventionSlug);

        return Object.fromEntries(rows.map((r) => [r.slug, { helpful: r.helpful, limited: r.limited }])) as Record<
            string,
            { helpful: number; limited: number }
        >;
    },

    async create(teacherId: string, input: PlanCreateInput) {
        const [row] = await db
            .insert(actionPlans)
            .values({ ...input, teacherId, status: "PLANNED" })
            .returning();
        return row;
    },

    setStatus(teacherId: string, id: string, status: PlanStatusInput) {
        return updateOwned(teacherId, id, { status });
    },

    reflect(teacherId: string, id: string, input: ReflectionInput) {
        return updateOwned(teacherId, id, {
            reflectionResult: input.result,
            reflectionReason: input.reason || null,
            reflectionNote: input.note?.trim() || null,
            reflectedAt: new Date(),
            status: "COMPLETED",
        });
    },

    update(teacherId: string, id: string, input: PlanUpdateInput) {
        const values: Partial<PlanInsert> = {};
        if (input.goal !== undefined) values.goal = input.goal.trim();
        if (input.timing !== undefined) values.timing = input.timing.trim();
        if (input.studentId !== undefined) values.studentId = input.studentId;
        return updateOwned(teacherId, id, values);
    },

    cancel(teacherId: string, id: string) {
        return updateOwned(teacherId, id, { status: "CANCELLED" });
    },

    restore(teacherId: string, id: string) {
        return updateOwned(teacherId, id, { status: "PLANNED" });
    },
};
