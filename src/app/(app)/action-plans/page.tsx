import type { Metadata } from "next";
import { MyInterventions } from "@/components/my-interventions";

export const metadata: Metadata = { title: "My Interventions | INKLUSA" };

export default function ActionPlansPage() {
    return <MyInterventions />;
}
