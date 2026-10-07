import type { Metadata } from "next";
import { KnowledgeManager } from "@/components/admin/knowledge-manager";

export const metadata: Metadata = { title: "Knowledge Base | INKLUSA Admin" };

export default function AdminKnowledgePage() {
    return <KnowledgeManager />;
}
