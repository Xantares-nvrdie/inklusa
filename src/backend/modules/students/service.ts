import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";

export const StudentService = {
    list(teacherId: string) {
        return db.select().from(students).where(eq(students.teacherId, teacherId)).orderBy(asc(students.createdAt));
    },

    async create(teacherId: string, label: string) {
        const clean = label.trim();
        const existing = await db
            .select()
            .from(students)
            .where(and(eq(students.teacherId, teacherId), eq(students.label, clean)));
        if (existing[0]) return existing[0];
        const [row] = await db.insert(students).values({ teacherId, label: clean }).returning();
        return row;
    },
};
