import { t } from "elysia";

/** Shared DTOs reused across backend modules. */
export const BarrierCategory = t.Union([
    t.Literal("INSTRUCTION"),
    t.Literal("READING"),
    t.Literal("FOCUS"),
    t.Literal("EXPRESSION"),
    t.Literal("PARTICIPATION"),
]);
export type BarrierCategory = typeof BarrierCategory.static;

export const IdParams = t.Object({ id: t.String() });
export const SlugParams = t.Object({ slug: t.String() });
export const ActiveBody = t.Object({ isActive: t.Boolean() });
