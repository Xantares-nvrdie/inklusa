"use client";

import { useEffect, useState } from "react";
import { PlanCard } from "@/components/plan-card";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { PlanRow } from "@/lib/knowledge";
import { useLanguage } from "@/lib/i18n/context";

export function MyInterventions() {
    const { t } = useLanguage();
    const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
    const [plans, setPlans] = useState<PlanRow[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const filters = [
        { id: "all" as const, label: t.myInterventions.filters.all },
        { id: "active" as const, label: t.myInterventions.filters.active },
        { id: "completed" as const, label: t.myInterventions.filters.completed },
    ];

    useEffect(() => {
        setPlans(null);
        api<PlanRow[]>(`/action-plans?filter=${filter}`).then(setPlans).catch((e) => setError(e.message));
    }, [filter]);

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <h1 className="text-4xl font-bold">{t.myInterventions.title}</h1>
                <ButtonLink id="btn-new-quick-check" href="/quick-check">{t.myInterventions.btnNew}</ButtonLink>
            </div>
            <div className="flex gap-2" role="group" aria-label="Filter">
                {filters.map((f) => (
                    <button key={f.id} id={`filter-${f.id}`} type="button" onClick={() => setFilter(f.id)} className={`cursor-pointer rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${filter === f.id ? "border-primary bg-primary text-white" : "border-line bg-surface hover:border-primary"}`}>
                        {f.label}
                    </button>
                ))}
            </div>
            {error && <p role="alert" className="rounded-2xl bg-[#fbe9e7] px-5 py-4 text-danger">{error}</p>}
            {plans === null && !error && <div className="h-28 animate-pulse rounded-card bg-surface-2" />}
            {plans?.length === 0 && <Card className="text-center text-muted">{t.myInterventions.empty}</Card>}
            <div className="grid gap-4 md:grid-cols-2">{plans?.map((p) => <PlanCard key={p.id} plan={p} />)}</div>
        </div>
    );
}
