import { Elysia } from "elysia";
import { KnowledgeService } from "./service";

/** Public read-only knowledge (non-sensitive: strategy content only). */
const knowledgeModule = new Elysia({ prefix: "/knowledge", tags: ["Knowledge"] }).get(
    "/",
    ({ set }) => {
        set.headers["cache-control"] = "public, s-maxage=3600, stale-while-revalidate=86400";
        return KnowledgeService.getPublic();
    },
    { detail: { summary: "Active expert-system knowledge (interventions + clarifications)" } },
);

export default knowledgeModule;
