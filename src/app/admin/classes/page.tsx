import type { Metadata } from "next";
import { ClassesManager } from "@/components/admin/classes-manager";

export const metadata: Metadata = { title: "Classes & Students | INKLUSA Admin" };

export default function AdminClassesPage() {
    return <ClassesManager />;
}
