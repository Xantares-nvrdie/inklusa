"use client";

import {
    AlertTriangle,
    BookMarked,
    CheckCircle2,
    ClipboardList,
    GraduationCap,
    ListTree,
    ThumbsDown,
    ThumbsUp,
} from "lucide-react";
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
    successRate: number;
    avgScore: number;
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
                        <span className="font-medium">{label(r.key ?? "—")}</span>
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
    const [ratingTab, setRatingTab] = useState<"needsReview" | "highSuccess" | "all">("needsReview");

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
    const ivCategory = (k: string) => {
        const item = interventions.find((i) => i.slug === k);
        return item ? catName(item.category) : "";
    };

    const rawList = s?.strategyEffectiveness ?? [];

    const sortedStrategies = [...rawList].sort((aItem, bItem) => {
        if (ratingTab === "needsReview") {
            // Lowest success rate first; if tied, highest struggle count first
            if (aItem.successRate !== bItem.successRate) return aItem.successRate - bItem.successRate;
            return bItem.struggleCount - aItem.struggleCount;
        }
        if (ratingTab === "highSuccess") {
            // Highest success rate first; if tied, highest total count
            if (aItem.successRate !== bItem.successRate) return bItem.successRate - aItem.successRate;
            return bItem.total - aItem.total;
        }
        // "all": most used first
        return bItem.total - aItem.total;
    });

    const displayStrategies =
        ratingTab === "needsReview"
            ? sortedStrategies.filter((item) => item.struggleCount > 0 || item.successRate < 70)
            : ratingTab === "highSuccess"
              ? sortedStrategies.filter((item) => item.successRate >= 70)
              : sortedStrategies;

    return (
        <div className="space-y-10">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold">{a.title}</h1>
                <p className="text-lg text-muted">{a.sub}</p>
            </div>
            {error && (
                <p role="alert" className="rounded-2xl bg-[#fbe9e7] px-5 py-4 text-danger">
                    {error}
                </p>
            )}

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map(({ label, value, sub, Icon, tone }) => (
                    <Card key={label} className="space-y-3 glass border-white/60">
                        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}>
                            <Icon size={20} aria-hidden="true" />
                        </span>
                        <div>
                            <p className="font-display text-4xl font-bold leading-none">{value ?? "–"}</p>
                            <p className="mt-1 text-sm text-muted">{label}</p>
                            {sub && <p className="text-xs text-muted">{sub}</p>}
                        </div>
                    </Card>
                ))}
            </section>

            {/* Strategy Feedback & Rating Section */}
            {s && (
                <Card className="space-y-6 glass border-white/60 p-6 sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold">{a.strategyEffectiveness}</h2>
                            <p className="text-sm text-muted mt-1">{a.effectivenessSub}</p>
                        </div>
                        <div className="flex flex-wrap gap-2" role="group" aria-label="Strategy Rating Tabs">
                            <button
                                type="button"
                                onClick={() => setRatingTab("needsReview")}
                                className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                                    ratingTab === "needsReview"
                                        ? "bg-danger text-white shadow-xs"
                                        : "border border-line bg-surface hover:border-danger/50 text-foreground"
                                }`}
                            >
                                <span className="inline-flex items-center gap-1.5">
                                    <ThumbsDown size={14} />
                                    {a.needsReview}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRatingTab("highSuccess")}
                                className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                                    ratingTab === "highSuccess"
                                        ? "bg-success text-white shadow-xs"
                                        : "border border-line bg-surface hover:border-success/50 text-foreground"
                                }`}
                            >
                                <span className="inline-flex items-center gap-1.5">
                                    <ThumbsUp size={14} />
                                    {a.highSuccess}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRatingTab("all")}
                                className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                                    ratingTab === "all"
                                        ? "bg-primary text-white shadow-xs"
                                        : "border border-line bg-surface hover:border-primary text-foreground"
                                }`}
                            >
                                {a.allStrategies}
                            </button>
                        </div>
                    </div>

                    {displayStrategies.length === 0 ? (
                        <div className="rounded-2xl border border-line/60 bg-surface/50 p-8 text-center text-muted">
                            <p className="text-sm font-medium">{a.noFeedbackYet}</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {displayStrategies.map((item) => {
                                const isStruggling = item.successRate < 60 || item.struggleCount > 0;
                                const isHigh = item.successRate >= 80;
                                const topReasonKey = item.topReasons[0]?.reason;
                                const topReasonLabel = topReasonKey
                                    ? ((REASON_LABELS_DATA[locale] as Record<string, string>)[topReasonKey] ??
                                      topReasonKey)
                                    : null;

                                return (
                                    <div
                                        key={item.slug}
                                        className="rounded-2xl border border-line/70 bg-surface/80 p-5 transition-all hover:border-primary/40 hover:shadow-sm"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            {/* Left details */}
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-bold text-lg text-foreground">
                                                        {ivName(item.slug)}
                                                    </h3>
                                                    {ivCategory(item.slug) && (
                                                        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">
                                                            {ivCategory(item.slug)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted">
                                                    {a.reflectionsCount(item.total)} •{" "}
                                                    <span className="font-medium text-foreground">
                                                        {a.avgScore}: {item.avgScore} / 4.0
                                                    </span>
                                                </p>

                                                {/* Challenge warning if any */}
                                                {topReasonLabel && (
                                                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-danger/20 bg-danger/5 px-3 py-1 text-xs text-danger">
                                                        <AlertTriangle size={13} className="shrink-0" />
                                                        <span>
                                                            <strong>{a.topReason}</strong> {topReasonLabel} (
                                                            {item.topReasons[0].count}x)
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right metrics */}
                                            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold border ${
                                                        isHigh
                                                            ? "bg-success/10 text-success border-success/30"
                                                            : isStruggling
                                                              ? "bg-danger/10 text-danger border-danger/30"
                                                              : "bg-accent-soft text-[#9a5612] border-accent/30"
                                                    }`}
                                                >
                                                    {isHigh ? (
                                                        <CheckCircle2 size={13} />
                                                    ) : isStruggling ? (
                                                        <AlertTriangle size={13} />
                                                    ) : (
                                                        <ThumbsUp size={13} />
                                                    )}
                                                    {item.successRate}% {a.successRate}
                                                </span>

                                                {/* Visual bar of response distribution */}
                                                <div className="flex h-2.5 w-48 overflow-hidden rounded-full bg-surface-2 border border-line/40">
                                                    <div
                                                        title={`${a.veryHelpful}: ${item.veryHelpful}`}
                                                        className="h-full bg-success transition-all duration-500"
                                                        style={{ width: `${(item.veryHelpful / item.total) * 100}%` }}
                                                    />
                                                    <div
                                                        title={`${a.helpful}: ${item.helpful}`}
                                                        className="h-full bg-emerald-400 transition-all duration-500"
                                                        style={{ width: `${(item.helpful / item.total) * 100}%` }}
                                                    />
                                                    <div
                                                        title={`${a.someChange}: ${item.someChange}`}
                                                        className="h-full bg-amber-400 transition-all duration-500"
                                                        style={{ width: `${(item.someChange / item.total) * 100}%` }}
                                                    />
                                                    <div
                                                        title={`${a.notHelpful}: ${item.notHelpful}`}
                                                        className="h-full bg-danger transition-all duration-500"
                                                        style={{ width: `${(item.notHelpful / item.total) * 100}%` }}
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2 text-[11px] text-muted">
                                                    <span className="text-success font-medium">
                                                        ✓ {item.successCount} berhasil
                                                    </span>
                                                    <span>•</span>
                                                    <span className="text-danger font-medium">
                                                        ✗ {item.struggleCount} kendala
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            )}

            {s && (
                <section className="grid gap-5 lg:grid-cols-2">
                    <Card className="space-y-5 glass border-white/60">
                        <h2 className="text-xl font-bold">{a.byBarrier}</h2>
                        <Bars rows={s.byCategory} label={catName} empty={a.noData} />
                    </Card>
                    <Card className="space-y-5 glass border-white/60">
                        <h2 className="text-xl font-bold">{a.results}</h2>
                        <Bars rows={s.results} label={(k) => RESULT_LABELS_DATA[locale][k] ?? k} empty={a.noData} />
                    </Card>
                    <Card className="space-y-5 glass border-white/60">
                        <h2 className="text-xl font-bold">{a.topBarriers}</h2>
                        <Bars rows={s.topBarriers} label={(k) => k} empty={a.noData} />
                    </Card>
                    <Card className="space-y-5 glass border-white/60">
                        <h2 className="text-xl font-bold">{a.topStrategies}</h2>
                        <Bars rows={s.topStrategies} label={ivName} empty={a.noData} />
                    </Card>
                </section>
            )}
        </div>
    );
}
