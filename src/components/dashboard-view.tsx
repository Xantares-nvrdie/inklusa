"use client";

import { ArrowRight, CheckCircle2, ClipboardCheck, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PlanCard } from "@/components/plan-card";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/context";
import type { PlanRow } from "@/lib/knowledge";
import { useKnowledge } from "@/lib/knowledge-context";

interface Summary {
    active: number;
    needsReflection: number;
    completed: number;
}

export function DashboardView() {
    const { t } = useLanguage();
    const { getIntervention } = useKnowledge();
    const [summary, setSummary] = useState<Summary | null>(null);
    const [plans, setPlans] = useState<PlanRow[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    function greeting() {
        const h = new Date().getHours();
        return h < 11
            ? t.dashboard.greeting.morning
            : h < 15
              ? t.dashboard.greeting.afternoon
              : t.dashboard.greeting.evening;
    }

    useEffect(() => {
        Promise.all([api<Summary>("/action-plans/summary"), api<PlanRow[]>("/action-plans")])
            .then(([s, p]) => {
                setSummary(s);
                setPlans(p);
            })
            .catch((e) => setError(e.message));
    }, []);

    const stats = [
        { label: t.dashboard.active, value: summary?.active, Icon: Sparkles, tone: "bg-sky-soft text-sky" },
        {
            label: t.dashboard.needsReflection,
            value: summary?.needsReflection,
            Icon: ClipboardCheck,
            tone: "bg-accent-soft text-[#9a5612]",
        },
        {
            label: t.dashboard.completed,
            value: summary?.completed,
            Icon: CheckCircle2,
            tone: "bg-primary-soft text-primary-strong",
        },
    ];

    const topEffective = (() => {
        if (!plans) return null;
        const counts: Record<string, number> = {};
        for (const p of plans) {
            if (
                p.status === "COMPLETED" &&
                (p.reflectionResult === "VERY_HELPFUL" || p.reflectionResult === "HELPFUL")
            ) {
                counts[p.interventionSlug] = (counts[p.interventionSlug] || 0) + 1;
            }
        }
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        return top ? top[0] : null;
    })();
    const needsReflection = plans?.filter((plan) => plan.status === "NEEDS_REFLECTION") ?? [];

    return (
        <div className="space-y-7 sm:space-y-10">
            <section className="space-y-1 sm:space-y-2">
                <p className="text-sm text-muted sm:text-base">
                    {greeting()}, {t.dashboard.teacher}.
                </p>
                <h1 className="text-[1.75rem] font-bold leading-tight xs:text-4xl sm:text-5xl">
                    {t.dashboard.heading}
                </h1>
            </section>

            {/* Hero CTA */}
            <Link
                id="cta-start-quick-check"
                href="/quick-check"
                className="group relative block overflow-hidden rounded-[1.75rem] bg-primary-strong p-5 text-white shadow-lift transition-transform duration-300 hover:-translate-y-1 active:scale-[0.99] xs:p-6 sm:rounded-[2rem] sm:p-10"
            >
                <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/30 blur-3xl transition-all duration-500 group-hover:scale-125" />
                <div className="relative flex items-end justify-between gap-4 sm:items-center">
                    <div className="min-w-0 space-y-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold sm:text-sm">
                            <Plus size={14} aria-hidden="true" /> {t.dashboard.quickCheckBadge}
                        </span>
                        <h2 className="text-[1.6rem] font-bold leading-tight xs:text-3xl sm:text-4xl">
                            {t.dashboard.startQuickCheck}
                        </h2>
                        <p className="max-w-md text-sm text-white/80 sm:text-base">{t.dashboard.quickCheckDesc}</p>
                    </div>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-[#3b2208] shadow-soft transition-transform duration-300 group-hover:translate-x-1 sm:h-14 sm:w-14">
                        <ArrowRight size={22} aria-hidden="true" />
                    </span>
                </div>
            </Link>

            {error && (
                <p role="alert" className="rounded-2xl bg-[#fbe9e7] px-5 py-4 text-danger">
                    {error}
                </p>
            )}

            {/* Three compact tiles side-by-side on phones instead of three tall stacked cards. */}
            <section className="grid grid-cols-3 gap-2.5 sm:gap-4" aria-label="Summary">
                {stats.map(({ label, value, Icon, tone }) => (
                    <Card
                        key={label}
                        className="flex flex-col items-start gap-3 rounded-2xl border-white/60 p-3.5 glass sm:flex-row sm:items-center sm:gap-4 sm:rounded-card sm:p-6"
                    >
                        <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl ${tone}`}
                        >
                            <Icon size={20} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <p className="font-display text-2xl font-bold leading-none sm:text-3xl">{value ?? "–"}</p>
                            <p className="mt-1 text-[11px] font-medium leading-tight text-muted xs:text-xs sm:text-sm">
                                {label}
                            </p>
                        </div>
                    </Card>
                ))}
            </section>

            {needsReflection.length > 0 && (
                <section className="space-y-4" aria-labelledby="ready-for-reflection">
                    <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#9a5612] sm:text-sm">
                                {t.dashboard.needsReflection}
                            </p>
                            <h2 id="ready-for-reflection" className="text-xl font-bold sm:text-2xl">
                                {t.dashboard.attentionTitle}
                            </h2>
                            <p className="text-sm text-muted sm:text-base">{t.dashboard.attentionDesc}</p>
                        </div>
                        <Link
                            href="/action-plans"
                            className="shrink-0 py-1 text-sm font-semibold text-primary hover:underline"
                        >
                            {t.dashboard.viewAll}
                        </Link>
                    </div>
                    <div className="grid w-full max-w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                        {needsReflection.slice(0, 2).map((p) => (
                            <PlanCard key={p.id} plan={p} />
                        ))}
                    </div>
                </section>
            )}

            {topEffective && (
                <Card className="flex items-start gap-4 border-success/20 bg-success/10 p-5 glass sm:items-center sm:p-6">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-success text-white sm:h-12 sm:w-12">
                        <Sparkles size={20} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-success sm:text-sm">
                            {t.dashboard.mostEffective}
                        </p>
                        <p className="text-lg font-bold leading-snug sm:text-xl">
                            {getIntervention(topEffective)?.title ?? topEffective}
                        </p>
                        <p className="text-sm text-muted">{t.dashboard.mostEffectiveDesc}</p>
                    </div>
                </Card>
            )}

            <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold sm:text-2xl">{t.dashboard.recentTitle}</h2>
                    <Link
                        href="/action-plans"
                        className="shrink-0 py-1 text-sm font-semibold text-primary hover:underline"
                    >
                        {t.dashboard.viewAll}
                    </Link>
                </div>
                {plans === null && !error && (
                    <div className="grid w-full max-w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="h-36 animate-pulse rounded-card bg-surface-2" />
                        <div className="hidden h-36 animate-pulse rounded-card bg-surface-2 md:block" />
                    </div>
                )}
                {plans?.length === 0 && (
                    <Card className="space-y-4 p-6 text-center sm:p-8">
                        <h3 className="text-xl font-bold">{t.dashboard.noInterventions}</h3>
                        <p className="text-muted">{t.dashboard.noInterventionsDesc}</p>
                        <div>
                            <ButtonLink href="/quick-check">{t.dashboard.btnStart}</ButtonLink>
                        </div>
                    </Card>
                )}
                <div className="grid w-full max-w-full min-w-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    {plans?.slice(0, 4).map((p) => (
                        <PlanCard key={p.id} plan={p} />
                    ))}
                </div>
            </section>
        </div>
    );
}
