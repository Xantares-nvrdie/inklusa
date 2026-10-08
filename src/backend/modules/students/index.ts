import { Elysia, t } from "elysia";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";
import { StudentService } from "./service";

const studentsModule = new Elysia({ prefix: "/students", tags: ["Students"] })
    .use(betterAuthMiddleware)

    .get("/classes", () => StudentService.listClasses(), {
        auth: true,
        detail: { summary: "List all classes with their students" },
    })

    .post("/classes", ({ body }) => StudentService.createClass(body.name), {
        auth: true,
        body: t.Object({ name: t.String({ minLength: 1, maxLength: 50 }) }),
        detail: { summary: "Create a new class" },
    })

    .get("/", () => StudentService.list(), {
        auth: true,
        detail: { summary: "List all students" },
    })

    .post("/", ({ body }) => StudentService.createStudent(body.classId, body.name), {
        auth: true,
        body: t.Object({ classId: t.String(), name: t.String({ minLength: 1, maxLength: 50 }) }),
        detail: { summary: "Add a new student to a class" },
    })
    .get(
        "/:id",
        async ({ params, set }) => {
            const row = await StudentService.getById(params.id);
            if (!row) {
                set.status = 404;
                return { message: "Student not found" };
            }
            return row;
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
        },
    );

export default studentsModule;
