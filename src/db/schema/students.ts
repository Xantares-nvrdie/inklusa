import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

/** Privacy-first: only a simple identifier ("Student A"), never personal data. */
export const students = pgTable(
    "students",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        teacherId: text("teacher_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        label: text("label").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (t) => ({
        teacherIdx: index("students_teacher_idx").on(t.teacherId),
    }),
);
