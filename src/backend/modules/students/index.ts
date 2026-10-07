import { Elysia, t } from "elysia";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";
import { StudentService } from "./service";

const studentsModule = new Elysia({ prefix: "/students", tags: ["Students"] })
    .use(betterAuthMiddleware)
    .get("/", ({ user }) => StudentService.list(user.id), {
        auth: true,
        detail: { summary: "List the teacher's student identifiers" },
    })
    .post("/", ({ user, body }) => StudentService.create(user.id, body.label), {
        auth: true,
        body: t.Object({ label: t.String({ minLength: 1, maxLength: 40 }) }),
        detail: { summary: "Add a minimal student identifier (e.g. 'Student A')" },
    })
    .get("/:id", async ({ user, params, set }) => {
        const row = await StudentService.getById(user.id, params.id);
        if (!row) {
            set.status = 404;
            return { message: "Student not found" };
        }
        return row;
    }, {
        auth: true,
        params: t.Object({ id: t.String() }),
    });

export default studentsModule;
