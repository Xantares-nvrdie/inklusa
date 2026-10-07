"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { flowQs } from "@/lib/flow";
import { useKnowledge } from "@/lib/knowledge-context";
import { useLanguage } from "@/lib/i18n/context";

export function Supports() {
    const { t } = useLanguage();
    const { getClarification, getIntervention } = useKnowledge();
    const sp = useSearchParams();
    const ctx = { student: sp.get("student") ?? "general", cat: sp.get("cat") ?? "", clar: sp.get("clar") ?? "" };
    const clar = getClarification(ctx.cat, ctx.clar);

    if (!clar) {
        return (
            <Card className="mx-auto max-w-xl space-y-4 text-center">
                <h1 className="text-2xl font-bold">{t.supports.missingContext}</h1>
                <ButtonLink href="/quick-check">{t.supports.btnStartQuickCheck}</ButtonLink>
            </Card>
        );
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">{t.supports.badge}</p>
                <h1 className="text-4xl font-bold">{t.supports.title}</h1>
                <p className="text-lg text-muted">
                    {t.supports.basedOn}<strong className="text-foreground">{clar.barrier}</strong>.
                </p>
            </div>

            <div className="space-y-4">
                {clar.supports.map((s, i) => {
                    const iv = getIntervention(s.slug);
                    if (!iv) return null;
                    return (
                        <Card key={s.slug} interactive className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-bold text-white">{i + 1}</span>
                            <div className="flex-1 space-y-1">
                                <h2 className="text-2xl font-bold">{iv.title}</h2>
                                <p className="text-muted">{iv.summary}</p>
                                <p className="text-sm"><strong>{t.supports.whyFits}</strong> {s.reason}</p>
                            </div>
                            <ButtonLink id={`btn-view-${iv.slug}`} href={`/interventions/${iv.slug}?${flowQs(ctx)}`} variant="soft">
                                {t.supports.viewStrategy} <ArrowRight size={16} aria-hidden="true" />
                            </ButtonLink>
                        </Card>
                    );
                })}
            </div>

            <Link href="/quick-check" className="inline-block text-sm font-medium text-muted hover:text-foreground">{t.supports.startDifferent}</Link>
        </div>
    );
}
