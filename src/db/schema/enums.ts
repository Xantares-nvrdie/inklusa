import { pgEnum } from "drizzle-orm/pg-core";

export const barrierCategoryEnum = pgEnum("barrier_category", [
    "INSTRUCTION",
    "READING",
    "FOCUS",
    "EXPRESSION",
    "PARTICIPATION",
]);

export const actionPlanStatusEnum = pgEnum("action_plan_status", [
    "PLANNED",
    "IN_PROGRESS",
    "NEEDS_REFLECTION",
    "COMPLETED",
]);

export const reflectionResultEnum = pgEnum("reflection_result", [
    "VERY_HELPFUL",
    "HELPFUL",
    "SOME_CHANGE",
    "NOT_HELPFUL",
]);
