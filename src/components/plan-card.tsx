"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/context";
import type { PlanRow } from "@/lib/knowledge";
import { useKnowledge } from "@/lib/knowledge-context";

export function PlanCard({ plan }: { plan: PlanRow }) {
    const { t } = useLanguage();
    const { getIntervention } = useKnowledge();
    const iv = getIntervention(plan.interventionSlug);
    const done = plan.status === "COMPLETED";

    return (
        <Link href={`/action-plans/${plan.id}`} className="block" id={`plan-${plan.id}`}>
            <Card interactive className="h-full space-y-3 glass border-white/60">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-primary">
                            {plan.student?.name ?? t.dashboard.generalClassroom}
                        </p>
                        <h3 className="text-xl font-bold">{plan.barrierTitle}</h3>
                    </div>
                    <StatusBadge status={plan.status} />
                </div>
                <p className="text-muted">{iv?.title ?? plan.interventionSlug}</p>
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    {done
                        ? t.myInterventions.viewReflection
                        : plan.status === "NEEDS_REFLECTION"
                          ? t.myInterventions.reflect
                          : t.myInterventions.continueBtn}
                    <ArrowRight size={14} aria-hidden="true" />
                </p>
            </Card>
        </Link>
    );
}
