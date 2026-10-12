import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { knowledgeClarifications, knowledgeInterventions } from "@/db/schema";
import { DEFAULT_KNOWLEDGE, type KnowledgeData } from "@/lib/knowledge";

export const KnowledgeService = {
    /** Active knowledge for teachers. Falls back to built-in defaults if the DB was never populated. */
    async getPublic(): Promise<KnowledgeData> {
        // Filter inactive rows in SQL and only select the columns the response needs.
        const [ivs, cls] = await Promise.all([
            db
                .select({
                    slug: knowledgeInterventions.slug,
                    category: knowledgeInterventions.category,
                    data: knowledgeInterventions.data,
                })
                .from(knowledgeInterventions)
                .where(eq(knowledgeInterventions.isActive, true))
                .orderBy(asc(knowledgeInterventions.createdAt)),
            db
                .select({
                    id: knowledgeClarifications.id,
                    category: knowledgeClarifications.category,
                    data: knowledgeClarifications.data,
                })
                .from(knowledgeClarifications)
                .where(eq(knowledgeClarifications.isActive, true))
                .orderBy(asc(knowledgeClarifications.createdAt)),
        ]);

        // Rare path: nothing active → distinguish "never populated" from "everything deactivated".
        if (ivs.length === 0 && cls.length === 0) {
            const [anyIv, anyCl] = await Promise.all([
                db.select({ one: sql`1` }).from(knowledgeInterventions).limit(1),
                db.select({ one: sql`1` }).from(knowledgeClarifications).limit(1),
            ]);
            if (anyIv.length === 0 && anyCl.length === 0) return DEFAULT_KNOWLEDGE;
        }

        return {
            interventions: ivs.map((r) => ({ slug: r.slug, category: r.category, ...r.data })),
            clarifications: cls.map((r) => ({ id: r.id, category: r.category, ...r.data })),
        };
    },

    /** Copies built-in knowledge into the DB (existing rows are left untouched). Two bulk inserts in one transaction. */
    async importDefaults() {
        const ivRows = DEFAULT_KNOWLEDGE.interventions.map(({ slug, category, ...data }) => ({ slug, category, data }));
        const clRows = DEFAULT_KNOWLEDGE.clarifications.map(({ id, category, ...data }) => ({ id, category, data }));

        await db.transaction(async (tx) => {
            if (ivRows.length) await tx.insert(knowledgeInterventions).values(ivRows).onConflictDoNothing();
            if (clRows.length) await tx.insert(knowledgeClarifications).values(clRows).onConflictDoNothing();
        });

        return { interventions: ivRows.length, clarifications: clRows.length };
    },
};
