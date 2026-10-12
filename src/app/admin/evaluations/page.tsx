import type { Metadata } from "next";
import { StrategyEvaluations } from "@/components/admin/strategy-evaluations";

export const metadata: Metadata = { title: "Strategy Evaluations | INKLUSA Admin" };

export default function AdminEvaluationsPage() {
    return <StrategyEvaluations />;
}
