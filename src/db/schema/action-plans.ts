import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { actionPlanStatusEnum, barrierCategoryEnum, reflectionResultEnum } from "./enums";
import { students } from "./students";

/**
 * One row = one intervention loop:
 * observed barrier -> chosen strategy -> status -> reflection.
 */
export const actionPlans = pgTable(
    "action_plans",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        teacherId: text("teacher_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        // null = anonymous / general classroom situation
        studentId: uuid("student_id").references(() => students.id, { onDelete: "set null" }),

        barrierCategory: barrierCategoryEnum("barrier_category").notNull(),
        clarificationId: text("clarification_id").notNull(),
        barrierTitle: text("barrier_title").notNull(),

        interventionSlug: text("intervention_slug").notNull(),
        goal: text("goal").notNull(),
        timing: text("timing").notNull().default("Next activity"),

        status: actionPlanStatusEnum("status").notNull().default("PLANNED"),

        reflectionResult: reflectionResultEnum("reflection_result"),
        reflectionNote: text("reflection_note"),
        reflectedAt: timestamp("reflected_at"),

        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (t) => ({
        teacherIdx: index("action_plans_teacher_idx").on(t.teacherId),
        statusIdx: index("action_plans_status_idx").on(t.status),
    }),
);
