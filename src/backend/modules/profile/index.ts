import { Elysia } from "elysia";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";
import { ProfileModel } from "./model";
import { ProfileService } from "./service";

const profileModule = new Elysia({ prefix: "/profile", tags: ["Profile"] })
    .use(betterAuthMiddleware)
    .get(
        "/",
        async ({ user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            const profile = await ProfileService.getProfile(user.id);
            if (!profile) {
                set.status = 404;
                return { message: "User not found" };
            }
            return profile;
        },
        { auth: true, detail: { summary: "Get current user profile" } },
    )
    .patch(
        "/",
        async ({ user, body, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            const updated = await ProfileService.updateProfile(user.id, body);
            return updated;
        },
        {
            auth: true,
            body: ProfileModel.updateBody,
            detail: { summary: "Update current user profile" },
        },
    );

export default profileModule;
