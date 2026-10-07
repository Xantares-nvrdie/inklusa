"use client";

import { ArrowRight, CheckCircle2, ClipboardCheck, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PlanCard } from "@/components/plan-card";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { PlanRow } from "@/lib/knowledge";
import { useLanguage } from "@/lib/i18n/context";
import { useKnowledge } from "@/lib/knowledge-context";

interface Summary { active: number; needsReflection: number; completed: number }

export function DashboardView() {
    const { t } = useLanguage();
    const { getIntervention } = useKnowledge();
    const [summary, setSummary] = useState<Summary | null>(null);
    const [plans, setPlans] = useState<PlanRow[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    function greeting() {
        const h = new Date().getHours();
        return h < 11 ? t.dashboard.greeting.morning : h < 15 ? t.dashboard.greeting.afternoon : t.dashboard.greeting.evening;
    }

    useEffect(() => {
        Promise.all([api<Summary>("/action-plans/summary"), api<PlanRow[]>("/action-plans")])
            .then(([s, p]) => { setSummary(s); setPlans(p); })
            .catch((e) => setError(e.message));
    }, []);

    const stats = [
        { label: t.dashboard.active, value: summary?.active, Icon: Sparkles, tone: "bg-sky-soft text-sky" },
        { label: t.dashboard.needsReflection, value: summary?.needsReflection, Icon: ClipboardCheck, tone: "bg-accent-soft text-[#9a5612]" },
        { label: t.dashboard.completed, value: summary?.completed, Icon: CheckCircle2, tone: "bg-primary-soft text-primary-strong" },
    ];

    const topEffective = (() => {
        if (!plans) return null;
        const counts: Record<string, number> = {};
        for (const p of plans) {
            if (p.status === "COMPLETED" && (p.reflectionResult === "VERY_HELPFUL" || p.reflectionResult === "HELPFUL")) {
                counts[p.interventionSlug] = (counts[p.interventionSlug] || 0) + 1;
            }
        }
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        return top ? top[0] : null;
    })();

    return (
        <div className="space-y-10">
            <section className="space-y-2">
                <p className="text-muted">{greeting()}, Teacher.</p>
                <h1 className="text-4xl font-bold sm:text-5xl">{t.dashboard.heading}</h1>
            </section>

            {/* Hero CTA */}
            <Link
                id="cta-start-quick-check"
                href="/quick-check"
                className="group relative block overflow-hidden rounded-[2rem] bg-primary-strong p-8 text-white shadow-lift transition-transform duration-300 hover:-translate-y-1 sm:p-10"
            >
                <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/30 blur-3xl transition-all duration-500 group-hover:scale-125" />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
                            <Plus size={14} aria-hidden="true" /> Quick Check
                        </span>
                        <h2 className="text-3xl font-bold sm:text-4xl">{t.dashboard.startQuickCheck}</h2>
                        <p className="max-w-md text-white/80">{t.dashboard.quickCheckDesc}</p>
                    </div>
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent text-[#3b2208] transition-transform duration-300 group-hover:translate-x-1">
                        <ArrowRight size={24} aria-hidden="true" />
                    </span>
                </div>
            </Link>

            {error && <p role="alert" className="rounded-2xl bg-[#fbe9e7] px-5 py-4 text-danger">{error}</p>}

            <section className="grid gap-4 sm:grid-cols-3" aria-label="Summary">
                {stats.map(({ label, value, Icon, tone }) => (
                    <Card key={label} className="flex items-center gap-4">
                        <span className={`grid h-12 w-12 place-items-center rounded-2xl ${tone}`}><Icon size={22} aria-hidden="true" /></span>
                        <div>
                            <p className="font-display text-3xl font-bold leading-none">{value ?? "–"}</p>
                            <p className="mt-1 text-sm text-muted">{label}</p>
                        </div>
                    </Card>
                ))}
            </section>

            {topEffective && (
                <Card className="flex flex-col gap-4 bg-success/10 border-success/20 sm:flex-row sm:items-center">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-success text-white">
                        <Sparkles size={20} />
                    </span>
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-success">Your Most Effective Strategy</p>
                        <p className="text-xl font-bold">{getIntervention(topEffective)?.title ?? topEffective}</p>
                        <p className="text-muted text-sm">Based on your past reflections, this strategy has been helpful multiple times.</p>
                    </div>
                </Card>
            )}

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{t.dashboard.recentTitle}</h2>
                    <Link href="/action-plans" className="text-sm font-semibold text-primary hover:underline">{t.dashboard.viewAll}</Link>
                </div>
                {plans === null && !error && <div className="h-28 animate-pulse rounded-card bg-surface-2" />}
                {plans?.length === 0 && (
                    <Card className="space-y-4 text-center">
                        <h3 className="text-xl font-bold">{t.dashboard.noInterventions}</h3>
                        <p className="text-muted">{t.dashboard.noInterventionsDesc}</p>
                        <div><ButtonLink href="/quick-check">{t.dashboard.btnStart}</ButtonLink></div>
                    </Card>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                    {plans?.slice(0, 4).map((p) => <PlanCard key={p.id} plan={p} />)}
                </div>
            </section>
        </div>
    );
}
