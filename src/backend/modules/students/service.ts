import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { students, classes } from "@/db/schema";

export const StudentService = {
    listClasses(teacherId: string) {
        return db.query.classes.findMany({
            where: eq(classes.teacherId, teacherId),
            orderBy: asc(classes.createdAt),
            with: { students: { orderBy: asc(students.createdAt) } },
        });
    },

    list(teacherId: string) {
        // Return students with their class info
        return db.query.students.findMany({
            where: eq(students.teacherId, teacherId),
            orderBy: asc(students.createdAt),
            with: { class: true },
        });
    },

    async createClass(teacherId: string, name: string) {
        const clean = name.trim();
        const existing = await db
            .select()
            .from(classes)
            .where(and(eq(classes.teacherId, teacherId), eq(classes.name, clean)));
        if (existing[0]) return existing[0];
        const [row] = await db.insert(classes).values({ teacherId, name: clean }).returning();
        return row;
    },

    async createStudent(teacherId: string, classId: string, name: string) {
        const clean = name.trim();
        const existing = await db
            .select()
            .from(students)
            .where(and(eq(students.teacherId, teacherId), eq(students.classId, classId), eq(students.name, clean)));
        if (existing[0]) return existing[0];
        const [row] = await db.insert(students).values({ teacherId, classId, name: clean }).returning();
        return row;
    },

    getById(teacherId: string, id: string) {
        return db.query.students.findFirst({
            where: and(eq(students.id, id), eq(students.teacherId, teacherId)),
            with: { class: true },
        });
    }
};
