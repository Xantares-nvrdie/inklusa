import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const classes = pgTable(
    "classes",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        teacherId: text("teacher_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (t) => ({
        teacherIdx: index("classes_teacher_idx").on(t.teacherId),
    }),
);
