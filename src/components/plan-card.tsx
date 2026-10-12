"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/context";
import type { PlanRow } from "@/lib/knowledge";
import { useKnowledge } from "@/lib/knowledge-context";

export function PlanCard({ plan }: { plan: PlanRow }) {
    const { t, locale } = useLanguage();
    const { getIntervention } = useKnowledge();
    const iv = getIntervention(plan.interventionSlug);
    const done = plan.status === "COMPLETED";
    const locked = plan.isOwner === false;

    const body = (
        <Card interactive={!locked} className="flex h-full flex-col gap-2.5 border-white/60 p-5 glass sm:gap-3 sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-sm font-semibold text-primary">
                    <span className="block truncate">
                        {plan.student?.name ?? t.dashboard.generalClassroom}
                        {plan.teacherName && <span className="ml-2 font-normal text-muted">• {plan.teacherName}</span>}
                    </span>
                </p>
                <span className="shrink-0">
                    <StatusBadge status={plan.status} />
                </span>
            </div>
            <h3 className="text-lg font-bold leading-snug sm:text-xl">{plan.barrierTitle}</h3>
            <p className="line-clamp-2 text-sm text-muted sm:text-base">{iv?.title ?? plan.interventionSlug}</p>
            {!locked && (
                <p className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-primary">
                    {done
                        ? t.myInterventions.viewReflection
                        : plan.status === "NEEDS_REFLECTION"
                          ? t.myInterventions.reflect
                          : plan.status === "CANCELLED"
                            ? locale === "id"
                                ? "Lihat detail"
                                : "View details"
                            : t.myInterventions.continueBtn}
                    <ArrowRight size={14} aria-hidden="true" />
                </p>
            )}
        </Card>
    );

    return locked ? (
        <div className="block" id={`plan-${plan.id}`}>
            {body}
        </div>
    ) : (
        <Link href={`/action-plans/${plan.id}`} className="block rounded-[var(--radius-card)]" id={`plan-${plan.id}`}>
            {body}
        </Link>
    );
}
