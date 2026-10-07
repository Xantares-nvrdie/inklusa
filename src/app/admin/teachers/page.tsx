import type { Metadata } from "next";
import { TeachersManager } from "@/components/admin/teachers-manager";

export const metadata: Metadata = { title: "Teachers | INKLUSA Admin" };

export default function AdminTeachersPage() {
    return <TeachersManager />;
}
