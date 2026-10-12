"use client";

import { ArrowRight, Eye } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { MobileActionBar } from "@/components/ui/action-bar";
import { BackLink } from "@/components/ui/back-link";
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
                <h1 className="text-2xl font-bold">{t.interventionDetail.notFound}</h1>
            </Card>
        );
    const category = getCategory(iv.category);

    return (
        <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
            <BackLink
                href={hasCtx ? `/quick-check/supports?${flowQs(ctx)}` : "/interventions"}
                label={t.interventionDetail.back}
            />
            <div className="space-y-2 sm:space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary sm:text-sm">
                    {category?.title}
                </p>
                <h1 className="text-[1.75rem] font-bold leading-tight xs:text-3xl sm:text-5xl">{iv.title}</h1>
            </div>

            <Card className="space-y-2 bg-primary-soft/60 glass border-white/60 p-5 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold">{t.interventionDetail.whyTryThis}</h2>
                <p className="text-[0.95rem] leading-relaxed sm:text-lg">{iv.why}</p>
            </Card>

            <section className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold">{t.interventionDetail.howToApply}</h2>
                <ol className="space-y-2.5 sm:space-y-3">
                    {iv.steps.map((s, i) => (
                        <li
                            key={s}
                            className="flex items-start gap-3.5 sm:items-center sm:gap-5 rounded-2xl border border-white/60 bg-surface/80 glass px-4 sm:px-6 py-3.5 sm:py-4 shadow-soft"
                        >
                            <span className="font-display text-lg leading-7 sm:text-2xl font-bold text-accent shrink-0">
                                0{i + 1}
                            </span>
                            <span className="text-[0.95rem] leading-7 sm:text-lg">{s}</span>
                        </li>
                    ))}
                </ol>
            </section>

            <Card className="flex items-start gap-3.5 sm:gap-4 bg-sky-soft/70 glass border-white/60 p-5 sm:p-6">
                <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-sky">
                    <Eye size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-bold">{t.interventionDetail.whatToObserve}</h2>
                    <p className="text-sm sm:text-base mt-1">{iv.observe}</p>
                </div>
            </Card>

            <MobileActionBar>
                {hasCtx ? (
                    <ButtonLink
                        id="btn-use-strategy"
                        href={`/action-plans/new?${flowQs(ctx)}&slug=${iv.slug}`}
                        size="lg"
                        className="h-auto min-h-12 w-full justify-center px-5 py-2.5 text-center leading-snug md:h-14 md:w-auto md:px-8 md:py-0"
                    >
                        <span>{t.interventionDetail.useStrategy}</span>
                        <ArrowRight size={18} aria-hidden="true" className="shrink-0" />
                    </ButtonLink>
                ) : (
                    <ButtonLink
                        id="btn-start-quick-check"
                        href="/quick-check"
                        size="lg"
                        variant="soft"
                        className="h-auto min-h-12 w-full justify-center px-5 py-2.5 text-center leading-snug md:h-14 md:w-auto md:px-8 md:py-0"
                    >
                        <span>{t.interventionDetail.startQuickCheckToUse}</span>
                        <ArrowRight size={18} aria-hidden="true" className="shrink-0" />
                    </ButtonLink>
                )}
            </MobileActionBar>
        </div>
    );
}
