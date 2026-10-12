import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { classes, students } from "@/db/schema";

export const StudentService = {
    /** Classes with their students, loaded in one query (drizzle relational query). */
    listClasses() {
        return db.query.classes.findMany({
            orderBy: asc(classes.createdAt),
            with: { students: { orderBy: asc(students.createdAt) } },
        });
    },

    list() {
        return db.query.students.findMany({
            orderBy: asc(students.createdAt),
            with: { class: true },
        });
    },

    getById(id: string) {
        return db.query.students.findFirst({
            where: eq(students.id, id),
            with: { class: true },
        });
    },

    /** Idempotent: returns the existing class when the name is already taken. */
    async createClass(name: string) {
        const clean = name.trim();
        const [existing] = await db.select().from(classes).where(eq(classes.name, clean)).limit(1);
        if (existing) return existing;
        const [row] = await db.insert(classes).values({ name: clean }).returning();
        return row;
    },

    async updateClass(id: string, name: string) {
        const [row] = await db.update(classes).set({ name: name.trim() }).where(eq(classes.id, id)).returning();
        return row;
    },

    async deleteClass(id: string) {
        await db.delete(classes).where(eq(classes.id, id));
    },

    /** Idempotent: returns the existing student when the name already exists in the class. */
    async createStudent(classId: string, name: string) {
        const clean = name.trim();
        const [existing] = await db
            .select()
            .from(students)
            .where(and(eq(students.classId, classId), eq(students.name, clean)))
            .limit(1);
        if (existing) return existing;
        const [row] = await db.insert(students).values({ classId, name: clean }).returning();
        return row;
    },

    async updateStudent(id: string, name: string) {
        const [row] = await db.update(students).set({ name: name.trim() }).where(eq(students.id, id)).returning();
        return row;
    },

    async deleteStudent(id: string) {
        await db.delete(students).where(eq(students.id, id));
    },
};
