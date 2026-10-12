import { t } from "elysia";
import { ActiveBody, IdParams, SlugParams } from "@/backend/utils/model";
import { KnowledgeModel } from "../knowledge/model";

export const AdminModel = {
    idParams: IdParams,
    slugParams: SlugParams,
    activeBody: ActiveBody,

    // ── Teachers ──
    createTeacherBody: t.Object({
        name: t.String({ minLength: 1, maxLength: 80 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8, maxLength: 100 }),
    }),
    banBody: t.Object({ banned: t.Boolean(), reason: t.Optional(t.String({ maxLength: 200 })) }),

    // ── Knowledge ──
    interventionBody: KnowledgeModel.interventionBody,
    createInterventionBody: t.Composite([t.Object({ slug: KnowledgeModel.slug }), KnowledgeModel.interventionBody]),
    clarificationBody: KnowledgeModel.clarificationBody,
    createClarificationBody: t.Composite([t.Object({ id: KnowledgeModel.slug }), KnowledgeModel.clarificationBody]),
};

export type CreateTeacherInput = typeof AdminModel.createTeacherBody.static;

/** Reflection score per result, used for the strategy effectiveness average (1–4). */
export const RESULT_SCORE = { VERY_HELPFUL: 4, HELPFUL: 3, SOME_CHANGE: 2, NOT_HELPFUL: 1 } as const;
