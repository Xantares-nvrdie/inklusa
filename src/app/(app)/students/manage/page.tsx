import type { Metadata } from "next";
import { ClassesManager } from "@/components/admin/classes-manager";
import { ManageBackLink } from "./back-link";

export const metadata: Metadata = { title: "Manage Classes & Students | INKLUSA" };
export default function ManageClassesPage() {
    return (
        <div className="mx-auto max-w-4xl space-y-4 md:py-6">
            <ManageBackLink />
            <ClassesManager />
        </div>
    );
}
