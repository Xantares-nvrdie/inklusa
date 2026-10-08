import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { classes, students } from "@/db/schema";

export const StudentService = {
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

    async createClass(name: string) {
        const clean = name.trim();
        const existing = await db
            .select()
            .from(classes)
            .where(eq(classes.name, clean));
        if (existing[0]) return existing[0];
        const [row] = await db.insert(classes).values({ name: clean }).returning();
        return row;
    },

    async createStudent(classId: string, name: string) {
        const clean = name.trim();
        const existing = await db
            .select()
            .from(students)
            .where(and(eq(students.classId, classId), eq(students.name, clean)));
        if (existing[0]) return existing[0];
        const [row] = await db.insert(students).values({ classId, name: clean }).returning();
        return row;
    },

    getById(id: string) {
        return db.query.students.findFirst({
            where: eq(students.id, id),
            with: { class: true },
        });
    },
};
