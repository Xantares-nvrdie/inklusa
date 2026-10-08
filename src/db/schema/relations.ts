import { relations } from "drizzle-orm";
import { actionPlans } from "./action-plans";
import { user } from "./auth";
import { classes, teacherClasses } from "./classes";
import { students } from "./students";

export const classesRelations = relations(classes, ({ many }) => ({
    students: many(students),
    teachers: many(teacherClasses),
}));

export const teacherClassesRelations = relations(teacherClasses, ({ one }) => ({
    teacher: one(user, { fields: [teacherClasses.teacherId], references: [user.id] }),
    class: one(classes, { fields: [teacherClasses.classId], references: [classes.id] }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
    class: one(classes, { fields: [students.classId], references: [classes.id] }),
    actionPlans: many(actionPlans),
}));

export const actionPlansRelations = relations(actionPlans, ({ one }) => ({
    teacher: one(user, { fields: [actionPlans.teacherId], references: [user.id] }),
    student: one(students, { fields: [actionPlans.studentId], references: [students.id] }),
}));
