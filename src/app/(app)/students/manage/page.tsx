import type { Metadata } from "next";
import { ClassesManager } from "@/components/admin/classes-manager";

export const metadata: Metadata = { title: "Manage Classes & Students | INKLUSA" };

export default function ManageClassesPage() {
    return (
        <div className="mx-auto max-w-4xl py-10">
            <ClassesManager />
        </div>
    );
}
