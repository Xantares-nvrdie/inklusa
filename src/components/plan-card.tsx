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
        <Card
            interactive={!locked}
            className="flex h-full w-full min-w-0 flex-col gap-2.5 border-white/60 p-4 sm:p-6 glass sm:gap-3 overflow-hidden"
        >
            <div className="flex w-full items-start justify-between gap-2 min-w-0">
                <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate text-xs sm:text-sm font-semibold text-primary">
                        {plan.student?.name ?? t.dashboard.generalClassroom}
                        {plan.teacherName && (
                            <span className="ml-1.5 font-normal text-muted">• {plan.teacherName}</span>
                        )}
                    </p>
                </div>
                <div className="shrink-0 pl-1">
                    <StatusBadge status={plan.status} />
                </div>
            </div>
            <h3 className="text-base sm:text-xl font-bold leading-snug break-words">{plan.barrierTitle}</h3>
            <p className="line-clamp-2 text-xs sm:text-base text-muted break-words">
                {iv?.title ?? plan.interventionSlug}
            </p>
            {done && (
                <p className="text-xs text-muted">
                    <time dateTime={plan.reflectedAt ?? plan.createdAt}>
                        {plan.reflectedAt
                            ? locale === "id"
                                ? "Direfleksikan"
                                : "Reflected"
                            : locale === "id"
                              ? "Dibuat"
                              : "Created"}{" "}
                        {new Date(plan.reflectedAt ?? plan.createdAt).toLocaleDateString(
                            locale === "id" ? "id-ID" : "en-US",
                            { day: "numeric", month: "short", year: "numeric" },
                        )}
                    </time>
                </p>
            )}
            {!locked && (
                <p className="mt-auto inline-flex items-center gap-1.5 pt-1 text-xs sm:text-sm font-semibold text-primary">
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
        <div className="block w-full min-w-0" id={`plan-${plan.id}`}>
            {body}
        </div>
    ) : (
        <Link
            href={`/action-plans/${plan.id}`}
            className="block w-full min-w-0 rounded-[var(--radius-card)]"
            id={`plan-${plan.id}`}
        >
            {body}
        </Link>
    );
}
