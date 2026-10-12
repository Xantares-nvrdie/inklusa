import { and, count, desc, eq, ne, sql } from "drizzle-orm";
import { auth } from "@/auth";
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

const TEACHER = eq(user.role, "TEACHER");

export const AdminService = {
    // ── Insights ─────────────────────────────────────────────────────────────
    async stats() {
        const [teachers] = await db.select({ n: count() }).from(user).where(TEACHER);
        const [bannedTeachers] = await db
            .select({ n: count() })
            .from(user)
            .where(and(TEACHER, eq(user.banned, true)));
        const [plans] = await db.select({ n: count() }).from(actionPlans);
        const [completed] = await db
            .select({ n: count() })
            .from(actionPlans)
            .where(eq(actionPlans.status, "COMPLETED"));
        const [ivs] = await db.select({ n: count() }).from(knowledgeInterventions);
        const [cls] = await db.select({ n: count() }).from(knowledgeClarifications);

        const byCategory = await db
            .select({ key: actionPlans.barrierCategory, n: count() })
            .from(actionPlans)
            .groupBy(actionPlans.barrierCategory);
        const topBarriers = await db
            .select({ key: actionPlans.barrierTitle, n: count() })
            .from(actionPlans)
            .groupBy(actionPlans.barrierTitle)
            .orderBy(desc(count()))
            .limit(5);
        const topStrategies = await db
            .select({ key: actionPlans.interventionSlug, n: count() })
            .from(actionPlans)
            .groupBy(actionPlans.interventionSlug)
            .orderBy(desc(count()))
            .limit(5);
        const results = await db
            .select({ key: actionPlans.reflectionResult, n: count() })
            .from(actionPlans)
            .where(eq(actionPlans.status, "COMPLETED"))
            .groupBy(actionPlans.reflectionResult);

        const reflectedPlans = await db
            .select({
                slug: actionPlans.interventionSlug,
                result: actionPlans.reflectionResult,
                reason: actionPlans.reflectionReason,
            })
            .from(actionPlans)
            .where(eq(actionPlans.status, "COMPLETED"));

        const strategyMap: Record<
            string,
            {
                slug: string;
                total: number;
                veryHelpful: number;
                helpful: number;
                someChange: number;
                notHelpful: number;
                reasons: Record<string, number>;
            }
        > = {};

        for (const row of reflectedPlans) {
            if (!row.slug || !row.result) continue;
            if (!strategyMap[row.slug]) {
                strategyMap[row.slug] = {
                    slug: row.slug,
                    total: 0,
                    veryHelpful: 0,
                    helpful: 0,
                    someChange: 0,
                    notHelpful: 0,
                    reasons: {},
                };
            }
            const item = strategyMap[row.slug];
            item.total++;
            if (row.result === "VERY_HELPFUL") item.veryHelpful++;
            else if (row.result === "HELPFUL") item.helpful++;
            else if (row.result === "SOME_CHANGE") item.someChange++;
            else if (row.result === "NOT_HELPFUL") item.notHelpful++;

            if (row.reason) {
                item.reasons[row.reason] = (item.reasons[row.reason] || 0) + 1;
            }
        }

        const strategyEffectiveness = Object.values(strategyMap).map((item) => {
            const successCount = item.veryHelpful + item.helpful;
            const struggleCount = item.someChange + item.notHelpful;
            const avgScore = Number(
                (
                    (item.veryHelpful * 4 + item.helpful * 3 + item.someChange * 2 + item.notHelpful * 1) /
                    item.total
                ).toFixed(1),
            );
            const effectivenessRate = Math.round((avgScore / 4) * 100);
            const topReasons = Object.entries(item.reasons)
                .map(([reason, count]) => ({ reason, count }))
                .sort((a, b) => b.count - a.count);

            return {
                slug: item.slug,
                total: item.total,
                successCount,
                struggleCount,
                avgScore,
                effectivenessRate,
                successRate: effectivenessRate,
                veryHelpful: item.veryHelpful,
                helpful: item.helpful,
                someChange: item.someChange,
                notHelpful: item.notHelpful,
                topReasons,
            };
        });

        return {
            totalTeachers: teachers.n,
            bannedTeachers: bannedTeachers.n,
            totalPlans: plans.n,
            completedPlans: completed.n,
            kbInterventions: ivs.n,
            kbClarifications: cls.n,
            byCategory,
            topBarriers,
            topStrategies,
            results,
            strategyEffectiveness,
        };
    },

    // ── Teachers ─────────────────────────────────────────────────────────────
    async listTeachers() {
        const users = await db.select().from(user).where(TEACHER).orderBy(desc(user.createdAt));
        const plans = await db
            .select({ teacherId: actionPlans.teacherId, status: actionPlans.status, n: count() })
            .from(actionPlans)
            .groupBy(actionPlans.teacherId, actionPlans.status);
        const studs = await db
            .select({ teacherId: actionPlans.teacherId, n: sql<number>`count(distinct ${actionPlans.studentId})` })
            .from(actionPlans)
            .groupBy(actionPlans.teacherId);

        return users.map((u) => {
            const mine = plans.filter((p) => p.teacherId === u.id);
            return {
                id: u.id,
                name: u.name,
                email: u.email,
                banned: !!u.banned,
                banReason: u.banReason,
                createdAt: u.createdAt,
                students: studs.find((s) => s.teacherId === u.id)?.n ?? 0,
                plans: mine.reduce((a, p) => a + p.n, 0),
                activePlans: mine
                    .filter((p) => p.status !== "COMPLETED" && p.status !== "CANCELLED")
                    .reduce((a, p) => a + p.n, 0),
            };
        });
    },

    async createTeacher(input: { name: string; email: string; password: string }) {
        const res = await auth.api.signUpEmail({ body: input });
        await db.update(user).set({ banned: false, banReason: null }).where(eq(user.id, res.user.id));
        return { id: res.user.id, name: res.user.name, email: res.user.email };
    },

    async setBan(id: string, banned: boolean, reason?: string) {
        const [row] = await db
            .update(user)
            .set({ banned, banReason: banned ? reason?.trim() || null : null })
            .where(and(eq(user.id, id), ne(user.role, "ADMIN")))
            .returning({ id: user.id });
        if (row && banned) await db.delete(session).where(eq(session.userId, id));
        return row ?? null;
    },

    async deleteTeacher(id: string) {
        const [row] = await db
            .delete(user)
            .where(and(eq(user.id, id), ne(user.role, "ADMIN")))
            .returning({ id: user.id });
        return row ?? null;
    },

    // ── Knowledge: interventions ─────────────────────────────────────────────
    async listInterventions() {
        const rows = await db.select().from(knowledgeInterventions).orderBy(knowledgeInterventions.createdAt);
        return rows.map((r) => ({ slug: r.slug, category: r.category, isActive: r.isActive, ...r.data }));
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
        const rows = await db.select().from(knowledgeClarifications).orderBy(knowledgeClarifications.createdAt);
        return rows.map((r) => ({ id: r.id, category: r.category, isActive: r.isActive, ...r.data }));
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

    // ── Strategy Feedback History ─────────────────────────────────────────────
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

        return rows.map((r) => ({
            id: r.id,
            status: r.status,
            barrierCategory: r.barrierCategory,
            barrierTitle: r.barrierTitle,
            goal: r.goal,
            timing: r.timing,
            reflectionResult: r.reflectionResult,
            reflectionReason: r.reflectionReason,
            reflectionNote: r.reflectionNote,
            reflectedAt: r.reflectedAt,
            createdAt: r.createdAt,
            teacher: {
                id: r.teacherId,
                name: r.teacherName,
                email: r.teacherEmail,
            },
            student: r.studentId
                ? {
                      id: r.studentId,
                      name: r.studentName,
                      className: r.className ?? null,
                  }
                : null,
        }));
    },
};
