import { Elysia, status } from "elysia";
import { auth } from "@/auth";

const betterAuthMiddleware = new Elysia({ name: "better-auth" }).mount(auth.handler).macro({
    auth: {
        async resolve({ request: { headers } }) {
            const session = await auth.api.getSession({ headers });
            if (!session) return status(401);
            return { user: session.user, session: session.session };
        },
    },
    // Admin portal (knowledge curator / user maintainer)
    adminOnly: {
        async resolve({ request: { headers } }) {
            const session = await auth.api.getSession({ headers });
            if (!session) return status(401);
            if ((session.user as { role?: string | null }).role !== "ADMIN") return status(403);
            return { user: session.user, session: session.session };
        },
    },
});

export default betterAuthMiddleware;
