import { Elysia } from "elysia";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";
import { StudentModel } from "./model";
import { StudentService } from "./service";

const studentsModule = new Elysia({ prefix: "/students", tags: ["Students"] })
    .use(betterAuthMiddleware)

    // ── Classes ──
    .get("/classes", () => StudentService.listClasses(), {
        auth: true,
        detail: { summary: "List all classes with their students" },
    })
    .post("/classes", ({ body }) => StudentService.createClass(body.name), {
        auth: true,
        body: StudentModel.nameBody,
        detail: { summary: "Create a new class" },
    })
    .patch("/classes/:id", ({ params, body }) => StudentService.updateClass(params.id, body.name), {
        auth: true,
        params: StudentModel.params,
        body: StudentModel.nameBody,
    })
    .delete(
        "/classes/:id",
        async ({ params }) => {
            await StudentService.deleteClass(params.id);
            return { success: true };
        },
        { auth: true, params: StudentModel.params },
    )

    // ── Students ──
    .get("/", () => StudentService.list(), {
        auth: true,
        detail: { summary: "List all students" },
    })
    .post("/", ({ body }) => StudentService.createStudent(body.classId, body.name), {
        auth: true,
        body: StudentModel.createStudentBody,
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
        { auth: true, params: StudentModel.params },
    )
    .patch("/:id", ({ params, body }) => StudentService.updateStudent(params.id, body.name), {
        auth: true,
        params: StudentModel.params,
        body: StudentModel.nameBody,
    })
    .delete(
        "/:id",
        async ({ params }) => {
            await StudentService.deleteStudent(params.id);
            return { success: true };
        },
        { auth: true, params: StudentModel.params },
    );

export default studentsModule;
