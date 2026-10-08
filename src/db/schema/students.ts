import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { classes } from "./classes";

export const students = pgTable(
    "students",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        classId: uuid("class_id")
            .notNull()
            .references(() => classes.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (t) => ({
        classIdx: index("students_class_idx").on(t.classId),
    }),
);
