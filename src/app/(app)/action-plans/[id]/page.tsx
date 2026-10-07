import type { Metadata } from "next";
import { PlanDetail } from "@/components/plan-detail";

export const metadata: Metadata = { title: "Intervention | INKLUSA" };

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <PlanDetail id={id} />;
}
