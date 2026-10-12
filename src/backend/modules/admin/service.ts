import { and, count, desc, eq, inArray, isNotNull, ne, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { countWhere } from "@/backend/utils/query";
import { db } from "@/db";
import {
    actionPlans,
    classes,
    knowledgeClarifications,
    knowledgeInterventions,
    session,
    students,
    user,
} from "@/db/schema";
import type { BarrierCategory, ClarificationData, InterventionData } from "@/lib/knowledge";
import { ACTIVE_STATUSES } from "../action-plans/model";
import { type CreateTeacherInput, RESULT_SCORE } from "./model";

const TEACHER = eq(user.role, "TEACHER");
const NOT_ADMIN = ne(user.role, "ADMIN");
const COMPLETED = eq(actionPlans.status, "COMPLETED");
const isResult = (r: keyof typeof RESULT_SCORE) => and(COMPLETED, eq(actionPlans.reflectionResult, r));

export const AdminService = {
    // ── Insights ─────────────────────────────────────────────────────────────
    /**
     * Global insights. Previously 12 sequential queries + a full scan of completed plans in JS;
     * now 5 aggregate queries executed concurrently, with all counting done in Postgres.
     */
    async stats() {
        const [[counts], byCategoryRows, topBarriers, perStrategy, reasonRows] = await Promise.all([
            // Teacher + knowledge-base counters in one round trip (uncorrelated scalar subqueries).
            db
                .select({
                    totalTeachers: countWhere(TEACHER),
                    bannedTeachers: countWhere(and(TEACHER, eq(user.banned, true))),
                    kbInterventions: sql<number>`(select count(*) from ${knowledgeInterventions})`.mapWith(Number),
                    kbClarifications: sql<number>`(select count(*) from ${knowledgeClarifications})`.mapWith(Number),
                })
                .from(user),

            // Per-category totals; summing them also yields total/completed plan counts.
            db
                .select({ key: actionPlans.barrierCategory, n: count(), completed: countWhere(COMPLETED) })
                .from(actionPlans)
                .groupBy(actionPlans.barrierCategory),

            db
                .select({ key: actionPlans.barrierTitle, n: count() })
                .from(actionPlans)
                .groupBy(actionPlans.barrierTitle)
                .orderBy(desc(count()))
                .limit(5),

            // One row per strategy: usage count + reflection outcome breakdown (feeds topStrategies,
            // results and strategyEffectiveness).
            db
                .select({
                    slug: actionPlans.interventionSlug,
                    n: count(),
                    veryHelpful: countWhere(isResult("VERY_HELPFUL")),
                    helpful: countWhere(isResult("HELPFUL")),
                    someChange: countWhere(isResult("SOME_CHANGE")),
                    notHelpful: countWhere(isResult("NOT_HELPFUL")),
                })
                .from(actionPlans)
                .groupBy(actionPlans.interventionSlug),

            db
                .select({ slug: actionPlans.interventionSlug, reason: actionPlans.reflectionReason, n: count() })
                .from(actionPlans)
                .where(and(COMPLETED, isNotNull(actionPlans.reflectionResult), isNotNull(actionPlans.reflectionReason)))
                .groupBy(actionPlans.interventionSlug, actionPlans.reflectionReason)
                .orderBy(desc(count())),
        ]);

        const totalPlans = byCategoryRows.reduce((a, r) => a + r.n, 0);
        const completedPlans = byCategoryRows.reduce((a, r) => a + r.completed, 0);

        const topStrategies = [...perStrategy]
            .sort((a, b) => b.n - a.n)
            .slice(0, 5)
            .map((r) => ({ key: r.slug, n: r.n }));

        // Completed plans grouped by reflection result (null = completed without a result).
        const sum = (k: "veryHelpful" | "helpful" | "someChange" | "notHelpful") =>
            perStrategy.reduce((a, r) => a + r[k], 0);
        const resultCounts = {
            VERY_HELPFUL: sum("veryHelpful"),
            HELPFUL: sum("helpful"),
            SOME_CHANGE: sum("someChange"),
            NOT_HELPFUL: sum("notHelpful"),
        };
        const reflected = Object.values(resultCounts).reduce((a, n) => a + n, 0);
        const results = [
            ...Object.entries(resultCounts).map(([key, n]) => ({ key: key as string | null, n })),
            { key: null, n: completedPlans - reflected },
        ].filter((r) => r.n > 0);

        const reasonsBySlug = new Map<string, { reason: string; count: number }[]>();
        for (const r of reasonRows) {
            if (!r.reason) continue;
            const list = reasonsBySlug.get(r.slug) ?? [];
            list.push({ reason: r.reason, count: r.n });
            reasonsBySlug.set(r.slug, list);
        }

        const strategyEffectiveness = perStrategy
            .map((r) => ({ ...r, total: r.veryHelpful + r.helpful + r.someChange + r.notHelpful }))
            .filter((r) => r.total > 0)
            .map((r) => {
                const avgScore = Number(
                    (
                        (r.veryHelpful * RESULT_SCORE.VERY_HELPFUL +
                            r.helpful * RESULT_SCORE.HELPFUL +
                            r.someChange * RESULT_SCORE.SOME_CHANGE +
                            r.notHelpful * RESULT_SCORE.NOT_HELPFUL) /
                        r.total
                    ).toFixed(1),
                );
                const effectivenessRate = Math.round((avgScore / 4) * 100);
                return {
                    slug: r.slug,
                    total: r.total,
                    successCount: r.veryHelpful + r.helpful,
                    struggleCount: r.someChange + r.notHelpful,
                    avgScore,
                    effectivenessRate,
                    successRate: effectivenessRate,
                    veryHelpful: r.veryHelpful,
                    helpful: r.helpful,
                    someChange: r.someChange,
                    notHelpful: r.notHelpful,
                    topReasons: reasonsBySlug.get(r.slug) ?? [],
                };
            });

        return {
            totalTeachers: counts.totalTeachers,
            bannedTeachers: counts.bannedTeachers,
            totalPlans,
            completedPlans,
            kbInterventions: counts.kbInterventions,
            kbClarifications: counts.kbClarifications,
            byCategory: byCategoryRows.map(({ key, n }) => ({ key, n })),
            topBarriers,
            topStrategies,
            results,
            strategyEffectiveness,
        };
    },

    // ── Teachers ─────────────────────────────────────────────────────────────
    /** Teachers with plan/student counters in one query (pre-aggregated subquery + LEFT JOIN). */
    async listTeachers() {
        const planStats = db
            .select({
                teacherId: actionPlans.teacherId,
                plans: count().as("plans"),
                activePlans: countWhere(inArray(actionPlans.status, [...ACTIVE_STATUSES])).as("active_plans"),
                students: sql<number>`count(distinct ${actionPlans.studentId})`.as("students"),
            })
            .from(actionPlans)
            .groupBy(actionPlans.teacherId)
            .as("plan_stats");

        const rows = await db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
                banned: user.banned,
                banReason: user.banReason,
                createdAt: user.createdAt,
                students: sql<number>`coalesce(${planStats.students}, 0)`.mapWith(Number),
                plans: sql<number>`coalesce(${planStats.plans}, 0)`.mapWith(Number),
                activePlans: sql<number>`coalesce(${planStats.activePlans}, 0)`.mapWith(Number),
            })
            .from(user)
            .leftJoin(planStats, eq(planStats.teacherId, user.id))
            .where(TEACHER)
            .orderBy(desc(user.createdAt));

        return rows.map((r) => ({ ...r, banned: !!r.banned }));
    },

    async createTeacher(input: CreateTeacherInput) {
        const normalizedEmail = input.email.trim().toLowerCase();

        const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, normalizedEmail)).limit(1);
        if (existing) throw new Error("User with this email already exists");

        let createdUserId: string;
        let createdUserName = input.name.trim();

        try {
            const res = await auth.api.signUpEmail({
                body: { name: createdUserName, email: normalizedEmail, password: input.password },
            });
            createdUserId = res.user.id;
            createdUserName = res.user.name;
        } catch (err) {
            // better-auth may throw BANNED_USER (databaseHooks sets banned: true) even though
            // the user row was created — recover it if so.
            const [found] = await db
                .select({ id: user.id, name: user.name })
                .from(user)
                .where(eq(user.email, normalizedEmail))
                .limit(1);
            if (!found) throw err;
            createdUserId = found.id;
            createdUserName = found.name;
        }

        await db.transaction(async (tx) => {
            // Admin-created accounts are active immediately.
            await tx
                .update(user)
                .set({ banned: false, banReason: null, role: "TEACHER" })
                .where(eq(user.id, createdUserId));
            // Drop the session signUpEmail created so the admin's own session is untouched.
            await tx.delete(session).where(eq(session.userId, createdUserId));
        });

        return { id: createdUserId, name: createdUserName, email: normalizedEmail };
    },

    async setBan(id: string, banned: boolean, reason?: string) {
        return db.transaction(async (tx) => {
            const [row] = await tx
                .update(user)
                .set({ banned, banReason: banned ? reason?.trim() || null : null })
                .where(and(eq(user.id, id), NOT_ADMIN))
                .returning({ id: user.id });
            if (row && banned) await tx.delete(session).where(eq(session.userId, id));
            return row ?? null;
        });
    },

    async deleteTeacher(id: string) {
        const [row] = await db
            .delete(user)
            .where(and(eq(user.id, id), NOT_ADMIN))
            .returning({ id: user.id });
        return row ?? null;
    },

    // ── Knowledge: interventions ─────────────────────────────────────────────
    async listInterventions() {
        const rows = await db
            .select({
                slug: knowledgeInterventions.slug,
                category: knowledgeInterventions.category,
                isActive: knowledgeInterventions.isActive,
                data: knowledgeInterventions.data,
            })
            .from(knowledgeInterventions)
            .orderBy(knowledgeInterventions.createdAt);
        return rows.map(({ data, ...r }) => ({ ...r, ...data }));
    },

    async createIntervention(slug: string, category: BarrierCategory, data: InterventionData, isActive = true) {
        const [row] = await db
            .insert(knowledgeInterventions)
            .values({ slug, category, data, isActive })
            .onConflictDoNothing()
            .returning({ slug: knowledgeInterventions.slug });
        return row ?? null;
    },

    async updateIntervention(slug: string, category: BarrierCategory, data: InterventionData, isActive?: boolean) {
        const [row] = await db
            .update(knowledgeInterventions)
            .set({ category, data, ...(isActive === undefined ? {} : { isActive }) })
            .where(eq(knowledgeInterventions.slug, slug))
            .returning({ slug: knowledgeInterventions.slug });
        return row ?? null;
    },

    async setInterventionActive(slug: string, isActive: boolean) {
        const [row] = await db
            .update(knowledgeInterventions)
            .set({ isActive })
            .where(eq(knowledgeInterventions.slug, slug))
            .returning({ slug: knowledgeInterventions.slug });
        return row ?? null;
    },

    async deleteIntervention(slug: string) {
        const [row] = await db
            .delete(knowledgeInterventions)
            .where(eq(knowledgeInterventions.slug, slug))
            .returning({ slug: knowledgeInterventions.slug });
        return row ?? null;
    },

    // ── Knowledge: clarifications ────────────────────────────────────────────
    async listClarifications() {
        const rows = await db
            .select({
                id: knowledgeClarifications.id,
                category: knowledgeClarifications.category,
                isActive: knowledgeClarifications.isActive,
                data: knowledgeClarifications.data,
            })
            .from(knowledgeClarifications)
            .orderBy(knowledgeClarifications.createdAt);
        return rows.map(({ data, ...r }) => ({ ...r, ...data }));
    },

    async createClarification(id: string, category: BarrierCategory, data: ClarificationData, isActive = true) {
        const [row] = await db
            .insert(knowledgeClarifications)
            .values({ id, category, data, isActive })
            .onConflictDoNothing()
            .returning({ id: knowledgeClarifications.id });
        return row ?? null;
    },

    async updateClarification(id: string, category: BarrierCategory, data: ClarificationData, isActive?: boolean) {
        const [row] = await db
            .update(knowledgeClarifications)
            .set({ category, data, ...(isActive === undefined ? {} : { isActive }) })
            .where(eq(knowledgeClarifications.id, id))
            .returning({ id: knowledgeClarifications.id });
        return row ?? null;
    },

    async setClarificationActive(id: string, isActive: boolean) {
        const [row] = await db
            .update(knowledgeClarifications)
            .set({ isActive })
            .where(eq(knowledgeClarifications.id, id))
            .returning({ id: knowledgeClarifications.id });
        return row ?? null;
    },

    async deleteClarification(id: string) {
        const [row] = await db
            .delete(knowledgeClarifications)
            .where(eq(knowledgeClarifications.id, id))
            .returning({ id: knowledgeClarifications.id });
        return row ?? null;
    },

    // ── Strategy feedback history ────────────────────────────────────────────
    async getStrategyFeedbackHistory(slug: string) {
        const rows = await db
            .select({
                id: actionPlans.id,
                status: actionPlans.status,
                barrierCategory: actionPlans.barrierCategory,
                barrierTitle: actionPlans.barrierTitle,
                goal: actionPlans.goal,
                timing: actionPlans.timing,
                reflectionResult: actionPlans.reflectionResult,
                reflectionReason: actionPlans.reflectionReason,
                reflectionNote: actionPlans.reflectionNote,
                reflectedAt: actionPlans.reflectedAt,
                createdAt: actionPlans.createdAt,
                teacherId: user.id,
                teacherName: user.name,
                teacherEmail: user.email,
                studentId: students.id,
                studentName: students.name,
                className: classes.name,
            })
            .from(actionPlans)
            .innerJoin(user, eq(actionPlans.teacherId, user.id))
            .leftJoin(students, eq(actionPlans.studentId, students.id))
            .leftJoin(classes, eq(students.classId, classes.id))
            .where(eq(actionPlans.interventionSlug, slug))
            .orderBy(desc(actionPlans.reflectedAt), desc(actionPlans.createdAt));

        return rows.map(({ teacherId, teacherName, teacherEmail, studentId, studentName, className, ...plan }) => ({
            ...plan,
            teacher: { id: teacherId, name: teacherName, email: teacherEmail },
            student: studentId ? { id: studentId, name: studentName, className: className ?? null } : null,
        }));
    },
};
