"use client";

import { ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { flowQs } from "@/lib/flow";
import { useLanguage } from "@/lib/i18n/context";
import { useKnowledge } from "@/lib/knowledge-context";

export function InterventionDetail({ slug }: { slug: string }) {
    const { t } = useLanguage();
    const { getCategory, getIntervention } = useKnowledge();
    const sp = useSearchParams();
    const iv = getIntervention(slug);
    const hasCtx = sp.get("cat") && sp.get("clar");
    const ctx = { student: sp.get("student") ?? "general", cat: sp.get("cat") ?? "", clar: sp.get("clar") ?? "" };

    if (!iv)
        return (
            <Card className="mx-auto max-w-xl text-center glass border-white/60">
                <h1 className="text-2xl font-bold">Strategy not found</h1>
            </Card>
        );
    const category = getCategory(iv.category);

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <Link
                href={hasCtx ? `/quick-check/supports?${flowQs(ctx)}` : "/interventions"}
                className="text-sm font-medium text-muted hover:text-foreground"
            >
                {t.interventionDetail.back}
            </Link>
            <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">{category?.title}</p>
                <h1 className="text-5xl font-bold">{iv.title}</h1>
            </div>

            <Card className="space-y-2 bg-primary-soft/60 glass border-white/60">
                <h2 className="text-lg font-bold">{t.interventionDetail.whyTryThis}</h2>
                <p className="text-lg">{iv.why}</p>
            </Card>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold">{t.interventionDetail.howToApply}</h2>
                <ol className="space-y-3">
                    {iv.steps.map((s, i) => (
                        <li
                            key={s}
                            className="flex items-center gap-5 rounded-2xl border border-white/60 bg-surface/80 glass px-6 py-4 shadow-soft"
                        >
                            <span className="font-display text-2xl font-bold text-accent">0{i + 1}</span>
                            <span className="text-lg">{s}</span>
                        </li>
                    ))}
                </ol>
            </section>

            <Card className="flex items-start gap-4 bg-sky-soft/70 glass border-white/60">
                <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-sky">
                    <Eye size={18} aria-hidden="true" />
                </span>
                <div>
                    <h2 className="text-lg font-bold">{t.interventionDetail.whatToObserve}</h2>
                    <p>{iv.observe}</p>
                </div>
            </Card>

            {hasCtx ? (
                <ButtonLink id="btn-use-strategy" href={`/action-plans/new?${flowQs(ctx)}&slug=${iv.slug}`} size="lg">
                    {t.interventionDetail.useStrategy} <ArrowRight size={18} aria-hidden="true" />
                </ButtonLink>
            ) : (
                <ButtonLink id="btn-start-quick-check" href="/quick-check" size="lg" variant="soft">
                    {t.interventionDetail.startQuickCheckToUse} <ArrowRight size={18} aria-hidden="true" />
                </ButtonLink>
            )}
        </div>
    );
}
