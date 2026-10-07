import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard-view";

export const metadata: Metadata = { title: "Dashboard | INKLUSA" };

export default function DashboardPage() {
    return <DashboardView />;
}

