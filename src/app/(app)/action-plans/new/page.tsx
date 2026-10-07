import type { Metadata } from "next";
import { Suspense } from "react";
import { NewActionPlan } from "@/components/new-action-plan";

export const metadata: Metadata = { title: "Create Action Plan | INKLUSA" };

export default function NewActionPlanPage() {
    return (
        <Suspense>
            <NewActionPlan />
        </Suspense>
    );
}
