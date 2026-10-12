import { t } from "elysia";

export const ProfileModel = {
    updateBody: t.Object({
        name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
        image: t.Optional(t.Union([t.String(), t.Null()])),
    }),
};
