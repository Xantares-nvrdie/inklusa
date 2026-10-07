import { Elysia } from "elysia";
import { KnowledgeService } from "./service";

/** Public read-only knowledge (non-sensitive: strategy content only). */
const knowledgeModule = new Elysia({ prefix: "/knowledge", tags: ["Knowledge"] }).get(
    "/",
    () => KnowledgeService.getPublic(),
    { detail: { summary: "Active expert-system knowledge (interventions + clarifications)" } },
);

export default knowledgeModule;
