import { relations } from "drizzle-orm";
import { actionPlans } from "./action-plans";
import { user } from "./auth";
import { students } from "./students";

export const studentsRelations = relations(students, ({ one, many }) => ({
    teacher: one(user, { fields: [students.teacherId], references: [user.id] }),
    actionPlans: many(actionPlans),
}));

export const actionPlansRelations = relations(actionPlans, ({ one }) => ({
    teacher: one(user, { fields: [actionPlans.teacherId], references: [user.id] }),
    student: one(students, { fields: [actionPlans.studentId], references: [students.id] }),
}));
