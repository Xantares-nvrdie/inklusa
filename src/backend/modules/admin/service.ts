import { and, count, desc, eq, ne } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { actionPlans, knowledgeClarifications, knowledgeInterventions, session, students, user } from "@/db/schema";
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
            .select({ teacherId: students.teacherId, n: count() })
            .from(students)
            .groupBy(students.teacherId);

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
                activePlans: mine.filter((p) => p.status !== "COMPLETED").reduce((a, p) => a + p.n, 0),
            };
        });
    },

    async createTeacher(input: { name: string; email: string; password: string }) {
        const res = await auth.api.signUpEmail({ body: input });
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
};
