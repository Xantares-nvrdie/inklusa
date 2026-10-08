"use client";

import { ArrowRight, History } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { flowQs } from "@/lib/flow";
import { useLanguage } from "@/lib/i18n/context";
import { useKnowledge } from "@/lib/knowledge-context";

export function Supports() {
    const { t } = useLanguage();
    const { getClarification, getIntervention } = useKnowledge();
    const sp = useSearchParams();
    const ctx = { student: sp.get("student") ?? "general", cat: sp.get("cat") ?? "", clar: sp.get("clar") ?? "" };
    const clar = getClarification(ctx.cat, ctx.clar);

    const [history, setHistory] = useState<Record<string, { helpful: number; limited: number }> | null>(null);

    useEffect(() => {
        if (!clar) return;
        const q = new URLSearchParams({ cat: ctx.cat, clar: ctx.clar, student: ctx.student });
        api<Record<string, { helpful: number; limited: number }>>(`/action-plans/history?${q.toString()}`)
            .then(setHistory)
            .catch(() => setHistory({}));
    }, [clar, ctx.cat, ctx.clar, ctx.student]);

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
                    {t.supports.basedOn}
                    <strong className="text-foreground">{clar.barrier}</strong>.
                </p>
            </div>

            <div className="space-y-4">
                {clar.supports.map((s, i) => {
                    const iv = getIntervention(s.slug);
                    if (!iv) return null;
                    const stats = history?.[s.slug];
                    const showHelpful = stats && stats.helpful > 0;
                    const showLimited = stats && stats.helpful === 0 && stats.limited > 0;

                    return (
                        <Card key={s.slug} interactive className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-bold text-white mt-1">
                                {i + 1}
                            </span>
                            <div className="flex-1 space-y-2">
                                <h2 className="text-2xl font-bold">{iv.title}</h2>
                                {showHelpful && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                                        <History size={14} />{" "}
                                        {t.supports.historyHelpful.replace("{count}", stats.helpful.toString())}
                                    </span>
                                )}
                                {showLimited && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-[#8c4b12]">
                                        <History size={14} />{" "}
                                        {t.supports.historyLimited.replace("{count}", stats.limited.toString())}
                                    </span>
                                )}
                                <p className="text-muted">{iv.summary}</p>
                                <p className="text-sm">
                                    <strong>{t.supports.whyFits}</strong> {s.reason}
                                </p>
                            </div>
                            <ButtonLink
                                id={`btn-view-${iv.slug}`}
                                href={`/interventions/${iv.slug}?${flowQs(ctx)}`}
                                variant="soft"
                                className="sm:self-center"
                            >
                                {t.supports.viewStrategy} <ArrowRight size={16} aria-hidden="true" />
                            </ButtonLink>
                        </Card>
                    );
                })}
            </div>

            <Link href="/quick-check" className="inline-block text-sm font-medium text-muted hover:text-foreground">
                {t.supports.startDifferent}
            </Link>
        </div>
    );
}
