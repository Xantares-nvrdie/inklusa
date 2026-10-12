import { t } from "elysia";
import { BarrierCategory } from "@/backend/utils/model";

/** Bilingual (en/id) text, both required. */
const Bi = t.Object({ en: t.String({ minLength: 1 }), id: t.String({ minLength: 1 }) });
const Steps = t.Object({
    en: t.Array(t.String({ minLength: 1 }), { minItems: 3, maxItems: 6 }),
    id: t.Array(t.String({ minLength: 1 }), { minItems: 3, maxItems: 6 }),
});

export const KnowledgeModel = {
    slug: t.String({ pattern: "^[a-z0-9]+(-[a-z0-9]+)*$", maxLength: 60 }),

    interventionBody: t.Object({
        category: BarrierCategory,
        title: Bi,
        summary: Bi,
        why: Bi,
        steps: Steps,
        observe: Bi,
        isActive: t.Optional(t.Boolean()),
    }),

    clarificationBody: t.Object({
        category: BarrierCategory,
        label: Bi,
        barrier: Bi,
        insight: Bi,
        supports: t.Array(t.Object({ slug: t.String(), reason: Bi }), { minItems: 1, maxItems: 5 }),
        isActive: t.Optional(t.Boolean()),
    }),
};
