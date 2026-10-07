import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { ClarificationData, InterventionData } from "../../lib/knowledge";
import { barrierCategoryEnum } from "./enums";

/**
 * Admin-managed expert-system knowledge base.
 * Bilingual (en/id) content is stored as JSON; category + key stay relational.
 */
export const knowledgeInterventions = pgTable("knowledge_interventions", {
    slug: text("slug").primaryKey(),
    category: barrierCategoryEnum("category").notNull(),
    data: jsonb("data").$type<InterventionData>().notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const knowledgeClarifications = pgTable("knowledge_clarifications", {
    id: text("id").primaryKey(),
    category: barrierCategoryEnum("category").notNull(),
    data: jsonb("data").$type<ClarificationData>().notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
