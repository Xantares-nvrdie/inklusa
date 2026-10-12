import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";

export const ProfileService = {
    async getProfile(userId: string) {
        const found = await db.query.user.findFirst({
            where: eq(user.id, userId),
            columns: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
            },
        });
        return found ?? null;
    },

    async updateProfile(userId: string, data: { name?: string; image?: string | null }) {
        const updateData: Partial<typeof user.$inferInsert> = {};
        if (data.name !== undefined) {
            updateData.name = data.name.trim();
        }
        if (data.image !== undefined) {
            updateData.image = data.image;
        }

        const [updated] = await db.update(user).set(updateData).where(eq(user.id, userId)).returning({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            createdAt: user.createdAt,
        });

        return updated;
    },
};
