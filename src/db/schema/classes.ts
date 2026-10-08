import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const classes = pgTable(
    "classes",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    }
);

export const teacherClasses = pgTable(
    "teacher_classes",
    {
        teacherId: text("teacher_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        classId: uuid("class_id")
            .notNull()
            .references(() => classes.id, { onDelete: "cascade" }),
    },
    (t) => ({
        pk: index("teacher_classes_pk").on(t.teacherId, t.classId),
        teacherIdx: index("teacher_classes_teacher_idx").on(t.teacherId),
        classIdx: index("teacher_classes_class_idx").on(t.classId),
    }),
);
