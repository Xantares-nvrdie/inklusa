"use client";

import {
    AlertTriangle,
    BarChart3,
    BookOpen,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Filter,
    History,
    Search,
    ThumbsDown,
    ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StrategyFeedbackHistoryModal } from "@/components/admin/strategy-feedback-history-modal";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { adminDict } from "@/lib/i18n/admin";
import { useLanguage } from "@/lib/i18n/context";
import { REASON_LABELS_DATA } from "@/lib/knowledge";
import { useKnowledge } from "@/lib/knowledge-context";

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

interface StatsResponse {
    strategyEffectiveness?: StrategyEffectivenessItem[];
}

const PAGE_SIZE = 6;

export function StrategyEvaluations() {
    const { locale } = useLanguage();
    const a = adminDict[locale].evaluations;
    const { categories, interventions } = useKnowledge();

    const [items, setItems] = useState<StrategyEffectivenessItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [tab, setTab] = useState<"needsReview" | "highSuccess" | "all">("needsReview");
    const [page, setPage] = useState(1);
    const [historySlug, setHistorySlug] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        api<StatsResponse>("/admin/stats")
            .then((data) => {
                setItems(data.strategyEffectiveness ?? []);
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Reset to page 1 on filter changes
    useEffect(() => {
        setPage(1);
    }, [search, categoryFilter, tab]);

    const catName = (k: string) => categories.find((c) => c.id === k)?.title ?? k;
    const ivName = (k: string) => interventions.find((i) => i.slug === k)?.title ?? k;
    const ivCategory = (k: string) => {
        const item = interventions.find((i) => i.slug === k);
        return item ? item.category : "";
    };

    // Global summary numbers
    const totalRated = items.length;
    const needsReviewCount = useMemo(
        () => items.filter((i) => i.effectivenessRate < 70 || i.struggleCount > 0).length,
        [items],
    );
    const highSuccessCount = useMemo(() => items.filter((i) => i.effectivenessRate >= 70).length, [items]);
    const totalReflections = useMemo(() => items.reduce((acc, curr) => acc + curr.total, 0), [items]);

    // Filter and sort items
    const filteredItems = useMemo(() => {
        return items
            .filter((item) => {
                // Tab filter
                if (tab === "needsReview" && !(item.effectivenessRate < 70 || item.struggleCount > 0)) {
                    return false;
                }
                if (tab === "highSuccess" && item.effectivenessRate < 70) {
                    return false;
                }

                // Category filter
                const itemCat = ivCategory(item.slug);
                if (categoryFilter !== "all" && itemCat !== categoryFilter) {
                    return false;
                }

                // Search query
                if (search.trim()) {
                    const query = search.toLowerCase();
                    const title = ivName(item.slug).toLowerCase();
                    const catTitle = catName(itemCat).toLowerCase();
                    const hasReason = item.topReasons.some((r) => {
                        const translated = (
                            (REASON_LABELS_DATA[locale] as Record<string, string>)[r.reason] ?? r.reason
                        ).toLowerCase();
                        return translated.includes(query);
                    });

                    if (!title.includes(query) && !catTitle.includes(query) && !hasReason) {
                        return false;
                    }
                }

                return true;
            })
            .sort((aItem, bItem) => {
                if (tab === "needsReview") {
                    // Lowest effectiveness rate first; if tied, highest struggle count first
                    if (aItem.effectivenessRate !== bItem.effectivenessRate) {
                        return aItem.effectivenessRate - bItem.effectivenessRate;
                    }
                    return bItem.struggleCount - aItem.struggleCount;
                }
                if (tab === "highSuccess") {
                    // Highest effectiveness rate first; if tied, most reflections
                    if (aItem.effectivenessRate !== bItem.effectivenessRate) {
                        return bItem.effectivenessRate - aItem.effectivenessRate;
                    }
                    return bItem.total - aItem.total;
                }
                // Tab "all": highest total reflections first, then highest rate
                if (bItem.total !== aItem.total) {
                    return bItem.total - aItem.total;
                }
                return bItem.effectivenessRate - aItem.effectivenessRate;
            });
    }, [items, tab, categoryFilter, search, locale, interventions, categories]);

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
    const paginatedItems = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredItems.slice(start, start + PAGE_SIZE);
    }, [filteredItems, page]);

    const fromIndex = filteredItems.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const toIndex = Math.min(page * PAGE_SIZE, filteredItems.length);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-medium text-sm">
                    <BarChart3 size={18} />
                    <span>{a.title}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{a.title}</h1>
                <p className="text-base sm:text-lg text-muted max-w-3xl">{a.sub}</p>
            </div>

            {error && (
                <div role="alert" className="rounded-2xl bg-danger/10 p-4 text-danger text-sm font-medium">
                    {error}
                </div>
            )}

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card className="glass border-white/60 p-5 space-y-2">
                    <div className="flex items-center justify-between text-muted text-xs font-medium">
                        <span>{a.summaryTotal}</span>
                        <BookOpen size={16} className="text-primary" />
                    </div>
                    <p className="font-display text-3xl font-bold">{totalRated}</p>
                </Card>

                <Card className="glass border-white/60 p-5 space-y-2">
                    <div className="flex items-center justify-between text-muted text-xs font-medium">
                        <span>{a.summaryNeedsReview}</span>
                        <AlertTriangle size={16} className="text-danger" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="font-display text-3xl font-bold text-danger">{needsReviewCount}</p>
                        <span className="text-xs text-muted">/ {totalRated}</span>
                    </div>
                </Card>

                <Card className="glass border-white/60 p-5 space-y-2">
                    <div className="flex items-center justify-between text-muted text-xs font-medium">
                        <span>{a.summaryEffective}</span>
                        <CheckCircle2 size={16} className="text-success" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="font-display text-3xl font-bold text-success">{highSuccessCount}</p>
                        <span className="text-xs text-muted">/ {totalRated}</span>
                    </div>
                </Card>

                <Card className="glass border-white/60 p-5 space-y-2">
                    <div className="flex items-center justify-between text-muted text-xs font-medium">
                        <span>{a.summaryTotalReflections}</span>
                        <BarChart3 size={16} className="text-sky" />
                    </div>
                    <p className="font-display text-3xl font-bold text-sky">{totalReflections}</p>
                </Card>
            </div>

            {/* Toolbar: Search, Category Filter, and Tabs */}
            <Card className="glass border-white/60 p-5 space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Search and Category Filter */}
                    <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                id="evaluations-search-input"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={a.searchPlaceholder}
                                className="w-full rounded-full border border-line bg-surface/80 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        <div className="relative shrink-0">
                            <select
                                id="evaluations-category-select"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full sm:w-auto appearance-none rounded-full border border-line bg-surface/80 py-2 pl-4 pr-9 text-sm text-foreground focus:border-primary focus:outline-none"
                            >
                                <option value="all">{a.allCategories}</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.title}
                                    </option>
                                ))}
                            </select>
                            <Filter
                                size={14}
                                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-surface-2/60 border border-line/60">
                        <button
                            type="button"
                            onClick={() => setTab("needsReview")}
                            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                                tab === "needsReview"
                                    ? "bg-danger text-white shadow-xs"
                                    : "text-muted hover:text-foreground hover:bg-surface"
                            }`}
                        >
                            <ThumbsDown size={13} />
                            <span>{a.tabs.needsReview}</span>
                            <span
                                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                                    tab === "needsReview" ? "bg-white/20 text-white" : "bg-danger/10 text-danger"
                                }`}
                            >
                                {needsReviewCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setTab("highSuccess")}
                            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                                tab === "highSuccess"
                                    ? "bg-success text-white shadow-xs"
                                    : "text-muted hover:text-foreground hover:bg-surface"
                            }`}
                        >
                            <ThumbsUp size={13} />
                            <span>{a.tabs.highSuccess}</span>
                            <span
                                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                                    tab === "highSuccess" ? "bg-white/20 text-white" : "bg-success/10 text-success"
                                }`}
                            >
                                {highSuccessCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setTab("all")}
                            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                                tab === "all"
                                    ? "bg-primary text-white shadow-xs"
                                    : "text-muted hover:text-foreground hover:bg-surface"
                            }`}
                        >
                            <span>{a.tabs.all}</span>
                            <span
                                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                                    tab === "all" ? "bg-white/20 text-white" : "bg-surface text-muted"
                                }`}
                            >
                                {totalRated}
                            </span>
                        </button>
                    </div>
                </div>
            </Card>

            {/* List of Strategy Cards */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                        <Card key={n} className="h-36 animate-pulse bg-surface-2/50" />
                    ))}
                </div>
            ) : filteredItems.length === 0 ? (
                <Card className="p-12 text-center glass border-white/60 space-y-3">
                    <p className="text-muted text-base">{a.empty}</p>
                    {(search || categoryFilter !== "all" || tab !== "all") && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setCategoryFilter("all");
                                setTab("all");
                            }}
                            className="text-primary hover:underline text-xs font-semibold"
                        >
                            Reset filters
                        </button>
                    )}
                </Card>
            ) : (
                <div className="space-y-4">
                    {paginatedItems.map((item) => {
                        const itemCat = ivCategory(item.slug);
                        const isHigh = item.effectivenessRate >= 70;
                        const isModerate = item.effectivenessRate >= 40 && item.effectivenessRate < 70;
                        const isLow = item.effectivenessRate < 40;

                        const badgeColorClass = isHigh
                            ? "bg-success/10 text-success border-success/30"
                            : isModerate
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                              : "bg-danger/10 text-danger border-danger/30";

                        const badgeLabel = isHigh ? a.badges.high : isModerate ? a.badges.moderate : a.badges.low;

                        const topReasonKey = item.topReasons[0]?.reason;
                        const topReasonLabel = topReasonKey
                            ? ((REASON_LABELS_DATA[locale] as Record<string, string>)[topReasonKey] ?? topReasonKey)
                            : null;

                        return (
                            <Card
                                key={item.slug}
                                className="glass border-white/60 p-5 sm:p-6 transition-all hover:border-primary/40 hover:shadow-sm"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                    {/* Left Details */}
                                    <div className="space-y-3 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="font-bold text-lg sm:text-xl text-foreground">
                                                {ivName(item.slug)}
                                            </h2>
                                            {itemCat && (
                                                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">
                                                    {catName(itemCat)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Metrics Subtitle */}
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                                            <span>{a.reflections(item.total)}</span>
                                            <span>•</span>
                                            <span className="font-semibold text-foreground">
                                                {a.score}: {item.avgScore} / 4.0
                                            </span>
                                            <span>•</span>
                                            <span className="text-success font-medium">
                                                ✓ {a.successCount(item.successCount)}
                                            </span>
                                            {item.struggleCount > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-danger font-medium">
                                                        ✗ {a.struggleCount(item.struggleCount)}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {/* Main Challenge Banner */}
                                        {topReasonLabel && (
                                            <div className="inline-flex items-center gap-2 rounded-xl border border-danger/25 bg-danger/5 px-3.5 py-2 text-xs text-danger">
                                                <AlertTriangle size={14} className="shrink-0" />
                                                <span>
                                                    <strong>{a.topChallenge}:</strong> {topReasonLabel} (
                                                    {item.topReasons[0].count}x)
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Section: Rate Badge & Rating Breakdown */}
                                    <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
                                        {/* Harmonized Badge: Rate + Label + Matching Color */}
                                        <div
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold border ${badgeColorClass}`}
                                        >
                                            {isHigh ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                                            <span>
                                                {item.effectivenessRate}% {a.effectivenessRate} • {badgeLabel}
                                            </span>
                                        </div>

                                        {/* Visual Segmented Distribution Bar */}
                                        <div className="space-y-1.5 w-full sm:w-60">
                                            <div
                                                className="flex h-3 w-full overflow-hidden rounded-full bg-surface-2 border border-line/50"
                                                title={`${a.breakdownTitle}: ${item.veryHelpful} Sangat Membantu, ${item.helpful} Membantu, ${item.someChange} Ada Perubahan, ${item.notHelpful} Belum Membantu`}
                                            >
                                                {item.veryHelpful > 0 && (
                                                    <div
                                                        title={`${a.veryHelpful}: ${item.veryHelpful}`}
                                                        className="h-full bg-success transition-all duration-500"
                                                        style={{ width: `${(item.veryHelpful / item.total) * 100}%` }}
                                                    />
                                                )}
                                                {item.helpful > 0 && (
                                                    <div
                                                        title={`${a.helpful}: ${item.helpful}`}
                                                        className="h-full bg-emerald-400 transition-all duration-500"
                                                        style={{ width: `${(item.helpful / item.total) * 100}%` }}
                                                    />
                                                )}
                                                {item.someChange > 0 && (
                                                    <div
                                                        title={`${a.someChange}: ${item.someChange}`}
                                                        className="h-full bg-amber-400 transition-all duration-500"
                                                        style={{ width: `${(item.someChange / item.total) * 100}%` }}
                                                    />
                                                )}
                                                {item.notHelpful > 0 && (
                                                    <div
                                                        title={`${a.notHelpful}: ${item.notHelpful}`}
                                                        className="h-full bg-danger transition-all duration-500"
                                                        style={{ width: `${(item.notHelpful / item.total) * 100}%` }}
                                                    />
                                                )}
                                            </div>

                                            {/* Micro-legend pills */}
                                            <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-muted">
                                                <span className="inline-flex items-center gap-1">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                                                    {a.veryHelpful} ({item.veryHelpful})
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                    {a.helpful} ({item.helpful})
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                                    {a.someChange} ({item.someChange})
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                                                    {a.notHelpful} ({item.notHelpful})
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => setHistorySlug(item.slug)}
                                                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-strong transition-all hover:bg-primary hover:text-white cursor-pointer shadow-2xs"
                                            >
                                                <History size={13} />
                                                <span>{a.viewHistoryBtn}</span>
                                                <span className="rounded-full bg-surface px-1.5 py-0.2 text-[10px] text-foreground font-bold">
                                                    {item.total}
                                                </span>
                                            </button>
                                            <Link
                                                href={`/admin/knowledge?search=${encodeURIComponent(ivName(item.slug))}`}
                                                className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors font-medium px-2 py-1.5"
                                            >
                                                <span>{a.viewInKb}</span>
                                                <ExternalLink size={12} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {filteredItems.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-line/60">
                    <p className="text-xs text-muted">
                        {a.pagination.showing(fromIndex, toIndex, filteredItems.length)}
                    </p>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-surface-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                        >
                            <ChevronLeft size={14} />
                            <span>{a.pagination.previous}</span>
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                // Simple windowing for many pages if needed
                                if (totalPages > 7 && p > 1 && p < totalPages && Math.abs(p - page) > 2) {
                                    if (p === 2 || p === totalPages - 1) {
                                        return (
                                            <span key={p} className="px-1 text-xs text-muted">
                                                …
                                            </span>
                                        );
                                    }
                                    return null;
                                }

                                return (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPage(p)}
                                        className={`h-8 w-8 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                            p === page
                                                ? "bg-primary text-white shadow-xs"
                                                : "text-muted hover:bg-surface-2 hover:text-foreground"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-surface-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                        >
                            <span>{a.pagination.next}</span>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Feedback History Modal */}
            <StrategyFeedbackHistoryModal
                slug={historySlug}
                strategyTitle={historySlug ? ivName(historySlug) : ""}
                onClose={() => setHistorySlug(null)}
            />
        </div>
    );
}
