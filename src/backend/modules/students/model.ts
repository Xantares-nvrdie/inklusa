import { t } from "elysia";
import { IdParams } from "@/backend/utils/model";

const Name = t.String({ minLength: 1, maxLength: 50 });

export const StudentModel = {
    params: IdParams,
    nameBody: t.Object({ name: Name }),
    createStudentBody: t.Object({ classId: t.String(), name: Name }),
};
