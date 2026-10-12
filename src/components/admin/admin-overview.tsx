"use client";

import { AlertTriangle, BarChart3, BookMarked, ClipboardList, GraduationCap, ListTree } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { adminDict } from "@/lib/i18n/admin";
import { useLanguage } from "@/lib/i18n/context";
import { REASON_LABELS_DATA, RESULT_LABELS_DATA } from "@/lib/knowledge";
import { useKnowledge } from "@/lib/knowledge-context";

interface Row {
    key: string | null;
    n: number;
}

export interface StrategyEffectivenessItem {
    slug: string;
    total: number;
    successCount: number;
    struggleCount: number;
    avgScore: number;
    effectivenessRate: number;
    successRate?: number;
    veryHelpful: number;
    helpful: number;
    someChange: number;
    notHelpful: number;
    topReasons: { reason: string; count: number }[];
}

interface Stats {
    totalTeachers: number;
    bannedTeachers: number;
    totalPlans: number;
    completedPlans: number;
    kbInterventions: number;
    kbClarifications: number;
    byCategory: Row[];
    topBarriers: Row[];
    topStrategies: Row[];
    results: Row[];
    strategyEffectiveness?: StrategyEffectivenessItem[];
}

function Bars({ rows, label, empty }: { rows: Row[]; label: (k: string) => string; empty: string }) {
    const max = Math.max(1, ...rows.map((r) => r.n));
    if (rows.length === 0) return <p className="text-sm text-muted">{empty}</p>;
    return (
        <ul className="space-y-3">
            {rows.map((r) => (
                <li key={r.key ?? "none"} className="space-y-1">
                    <div className="flex justify-between gap-3 text-sm">
                        <span className="min-w-0 font-medium">{label(r.key ?? "—")}</span>
                        <span className="font-display font-bold">{r.n}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${(r.n / max) * 100}%` }}
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
}

export function AdminOverview() {
    const { locale } = useLanguage();
    const a = adminDict[locale].overview;
    const { categories, interventions } = useKnowledge();
    const [s, setS] = useState<Stats | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api<Stats>("/admin/stats")
            .then(setS)
            .catch((e) => setError(e.message));
    }, []);

    const cards = [
        {
            label: a.teachers,
            value: s?.totalTeachers,
            sub: s ? `${s.bannedTeachers} ${a.banned}` : "",
            Icon: GraduationCap,
            tone: "bg-sky-soft text-sky",
        },
        {
            label: a.plans,
            value: s?.totalPlans,
            sub: s ? `${s.completedPlans} ${a.completed}` : "",
            Icon: ClipboardList,
            tone: "bg-accent-soft text-[#9a5612]",
        },
        {
            label: a.kbStrategies,
            value: s?.kbInterventions,
            sub: "",
            Icon: BookMarked,
            tone: "bg-primary-soft text-primary-strong",
        },
        {
            label: a.kbClarifications,
            value: s?.kbClarifications,
            sub: "",
            Icon: ListTree,
            tone: "bg-[#f3e6f7] text-[#7a3f8f]",
        },
    ];

    const catName = (k: string) => categories.find((c) => c.id === k)?.title ?? k;
    const ivName = (k: string) => interventions.find((i) => i.slug === k)?.title ?? k;

    const rawList = s?.strategyEffectiveness ?? [];
    const needsReviewList = rawList
        .filter((item) => (item.effectivenessRate ?? item.successRate ?? 0) < 70 || item.struggleCount > 0)
        .sort((aItem, bItem) => {
            const rateA = aItem.effectivenessRate ?? aItem.successRate ?? 0;
            const rateB = bItem.effectivenessRate ?? bItem.successRate ?? 0;
            if (rateA !== rateB) return rateA - rateB;
            return bItem.struggleCount - aItem.struggleCount;
        });

    const highSuccessCount = rawList.filter((item) => (item.effectivenessRate ?? item.successRate ?? 0) >= 70).length;

    const totalReflections = rawList.reduce((acc, curr) => acc + curr.total, 0);

    return (
        <div className="space-y-8 sm:space-y-10">
            <div className="space-y-2">
                <h1 className="text-2xl sm:text-4xl font-bold">{a.title}</h1>
                <p className="text-base sm:text-lg text-muted">{a.sub}</p>
            </div>
            {error && (
                <p role="alert" className="rounded-2xl bg-[#fbe9e7] px-5 py-4 text-danger">
                    {error}
                </p>
            )}

            <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {cards.map(({ label, value, sub, Icon, tone }) => (
                    <Card
                        key={label}
                        className="flex flex-col justify-between glass border-white/60 p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-card shadow-soft space-y-3"
                    >
                        <span
                            className={`grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl sm:rounded-2xl ${tone}`}
                        >
                            <Icon size={17} className="sm:hidden" aria-hidden="true" />
                            <Icon size={20} className="hidden sm:block" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-none">
                                {value ?? "–"}
                            </p>
                            <p className="mt-1 text-xs sm:text-sm font-medium text-muted leading-tight">{label}</p>
                            {sub ? (
                                <p className="mt-0.5 text-[11px] sm:text-xs text-muted leading-tight">{sub}</p>
                            ) : (
                                <p
                                    className="mt-0.5 text-[11px] sm:text-xs text-transparent select-none leading-tight"
                                    aria-hidden="true"
                                >
                                    &nbsp;
                                </p>
                            )}
                        </div>
                    </Card>
                ))}
            </section>

            {/* Strategy Feedback & Rating Summary Widget */}
            {s && (
                <Card className="space-y-5 border-white/60 p-4 glass sm:p-7">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-soft text-primary-strong">
                                    <BarChart3 size={17} />
                                </span>
                                <h2 className="text-lg sm:text-2xl font-bold text-foreground">
                                    {a.strategyEffectiveness}
                                </h2>
                            </div>
                            <p className="text-xs sm:text-sm text-muted">{a.effectivenessSub}</p>
                        </div>
                        <Link
                            id="view-all-evaluations-btn"
                            href="/admin/evaluations"
                            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-primary-hover sm:h-10 sm:w-auto sm:text-xs"
                        >
                            <span>{a.viewAllEvaluations}</span>
                        </Link>
                    </div>

                    {/* Needs review alert if any */}
                    {needsReviewList.length > 0 && (
                        <div className="flex items-center gap-2.5 rounded-2xl border border-danger/25 bg-danger/5 p-4 text-sm text-danger">
                            <AlertTriangle size={18} className="shrink-0" />
                            <span className="font-medium">{a.reviewNeededAlert(needsReviewList.length)}</span>
                        </div>
                    )}

                    {/* Quick Metric Pills */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1 sm:grid-cols-4 sm:gap-3">
                        <div className="rounded-xl border border-line/60 bg-surface/70 p-3.5 space-y-1">
                            <p className="text-xs text-muted">Total Strategi Berating</p>
                            <p className="font-display text-2xl font-bold">{rawList.length}</p>
                        </div>
                        <div className="rounded-xl border border-line/60 bg-surface/70 p-3.5 space-y-1">
                            <p className="text-xs text-muted">Perlu Evaluasi</p>
                            <p className="font-display text-2xl font-bold text-danger">{needsReviewList.length}</p>
                        </div>
                        <div className="rounded-xl border border-line/60 bg-surface/70 p-3.5 space-y-1">
                            <p className="text-xs text-muted">Efektivitas Tinggi</p>
                            <p className="font-display text-2xl font-bold text-success">{highSuccessCount}</p>
                        </div>
                        <div className="rounded-xl border border-line/60 bg-surface/70 p-3.5 space-y-1">
                            <p className="text-xs text-muted">Total Refleksi</p>
                            <p className="font-display text-2xl font-bold text-sky">{totalReflections}</p>
                        </div>
                    </div>

                    {/* Top Strategies Needing Review Preview */}
                    {needsReviewList.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <p className="text-xs font-semibold text-muted uppercase tracking-wider">{a.needsReview}</p>
                            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                                {needsReviewList.slice(0, 3).map((item) => {
                                    const rate = item.effectivenessRate ?? item.successRate ?? 0;
                                    const isModerate = rate >= 40 && rate < 70;
                                    const badgeClass = isModerate
                                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                                        : "bg-danger/10 text-danger border-danger/30";

                                    const topReasonKey = item.topReasons[0]?.reason;
                                    const topReasonLabel = topReasonKey
                                        ? ((REASON_LABELS_DATA[locale] as Record<string, string>)[topReasonKey] ??
                                          topReasonKey)
                                        : null;

                                    return (
                                        <Link
                                            key={item.slug}
                                            href="/admin/evaluations"
                                            className="group flex flex-col justify-between rounded-xl border border-line/70 bg-surface/80 p-3.5 transition-all hover:border-primary/50 hover:shadow-xs"
                                        >
                                            <div className="space-y-1.5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary">
                                                        {ivName(item.slug)}
                                                    </h3>
                                                    <span
                                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold border ${badgeClass}`}
                                                    >
                                                        {rate}%
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-muted">
                                                    {a.reflectionsCount(item.total)} • {a.avgScore}: {item.avgScore} /
                                                    4.0
                                                </p>
                                            </div>

                                            {topReasonLabel && (
                                                <p className="mt-2 text-[11px] text-danger/90 line-clamp-1">
                                                    ⚠️ {topReasonLabel}
                                                </p>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {s && (
                <section className="grid gap-5 lg:grid-cols-2">
                    <Card className="space-y-4 border-white/60 p-5 glass sm:space-y-5 sm:p-6">
                        <h2 className="text-lg font-bold sm:text-xl">{a.byBarrier}</h2>
                        <Bars rows={s.byCategory} label={catName} empty={a.noData} />
                    </Card>
                    <Card className="space-y-4 border-white/60 p-5 glass sm:space-y-5 sm:p-6">
                        <h2 className="text-lg font-bold sm:text-xl">{a.results}</h2>
                        <Bars rows={s.results} label={(k) => RESULT_LABELS_DATA[locale][k] ?? k} empty={a.noData} />
                    </Card>
                    <Card className="space-y-4 border-white/60 p-5 glass sm:space-y-5 sm:p-6">
                        <h2 className="text-lg font-bold sm:text-xl">{a.topBarriers}</h2>
                        <Bars rows={s.topBarriers} label={(k) => k} empty={a.noData} />
                    </Card>
                    <Card className="space-y-4 border-white/60 p-5 glass sm:space-y-5 sm:p-6">
                        <h2 className="text-lg font-bold sm:text-xl">{a.topStrategies}</h2>
                        <Bars rows={s.topStrategies} label={ivName} empty={a.noData} />
                    </Card>
                </section>
            )}
        </div>
    );
}
