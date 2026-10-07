import { asc } from "drizzle-orm";
import { db } from "@/db";
import { knowledgeClarifications, knowledgeInterventions } from "@/db/schema";
import { DEFAULT_KNOWLEDGE, type KnowledgeData } from "@/lib/knowledge";

export const KnowledgeService = {
    /** Active knowledge for teachers. Falls back to built-in defaults if the DB was never populated. */
    async getPublic(): Promise<KnowledgeData> {
        const [ivs, cls] = await Promise.all([
            db.select().from(knowledgeInterventions).orderBy(asc(knowledgeInterventions.createdAt)),
            db.select().from(knowledgeClarifications).orderBy(asc(knowledgeClarifications.createdAt)),
        ]);
        if (ivs.length === 0 && cls.length === 0) return DEFAULT_KNOWLEDGE;
        return {
            interventions: ivs.filter((r) => r.isActive).map((r) => ({ slug: r.slug, category: r.category, ...r.data })),
            clarifications: cls.filter((r) => r.isActive).map((r) => ({ id: r.id, category: r.category, ...r.data })),
        };
    },

    /** Copies built-in knowledge into the DB (existing rows are left untouched). */
    async importDefaults() {
        for (const i of DEFAULT_KNOWLEDGE.interventions) {
            const { slug, category, ...data } = i;
            await db.insert(knowledgeInterventions).values({ slug, category, data }).onConflictDoNothing();
        }
        for (const c of DEFAULT_KNOWLEDGE.clarifications) {
            const { id, category, ...data } = c;
            await db.insert(knowledgeClarifications).values({ id, category, data }).onConflictDoNothing();
        }
        return {
            interventions: DEFAULT_KNOWLEDGE.interventions.length,
            clarifications: DEFAULT_KNOWLEDGE.clarifications.length,
        };
    },
};
