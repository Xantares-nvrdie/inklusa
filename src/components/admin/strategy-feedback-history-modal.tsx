"use client";

import { AlertTriangle, CheckCircle2, Clock, GraduationCap, History, MessageSquare, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";
import { adminDict } from "@/lib/i18n/admin";
import { useLanguage } from "@/lib/i18n/context";
import { REASON_LABELS_DATA } from "@/lib/knowledge";

export interface FeedbackHistoryItem {
    id: string;
    status: string;
    barrierCategory: string;
    barrierTitle: string;
    goal: string;
    timing: string;
    reflectionResult: "VERY_HELPFUL" | "HELPFUL" | "SOME_CHANGE" | "NOT_HELPFUL" | null;
    reflectionReason: string | null;
    reflectionNote: string | null;
    reflectedAt: string | null;
    createdAt: string;
    teacher: {
        id: string;
        name: string;
        email: string;
    };
    student: {
        id: string;
        name: string;
        className: string | null;
    } | null;
}

interface StrategyFeedbackHistoryModalProps {
    slug: string | null;
    strategyTitle: string;
    onClose: () => void;
}

export function StrategyFeedbackHistoryModal({ slug, strategyTitle, onClose }: StrategyFeedbackHistoryModalProps) {
    const { locale } = useLanguage();
    const a = adminDict[locale].evaluations;
    const m = a.historyModal;

    const [items, setItems] = useState<FeedbackHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "completed" | "challenges">("all");

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        api<FeedbackHistoryItem[]>(`/admin/knowledge/interventions/${slug}/feedback`)
            .then(setItems)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [slug]);

    const completedItems = useMemo(() => items.filter((i) => i.status === "COMPLETED" || i.reflectionResult), [items]);

    const challengeItems = useMemo(
        () =>
            items.filter(
                (i) =>
                    i.reflectionResult === "SOME_CHANGE" ||
                    i.reflectionResult === "NOT_HELPFUL" ||
                    Boolean(i.reflectionReason),
            ),
        [items],
    );

    const filteredItems = useMemo(() => {
        if (filter === "completed") return completedItems;
        if (filter === "challenges") return challengeItems;
        return items;
    }, [items, filter, completedItems, challengeItems]);

    if (!slug) return null;

    const getOutcomeBadge = (res: FeedbackHistoryItem["reflectionResult"], status: string) => {
        if (!res) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted">
                    <Clock size={12} />
                    <span>{status}</span>
                </span>
            );
        }

        switch (res) {
            case "VERY_HELPFUL":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs font-bold text-success">
                        <CheckCircle2 size={12} />
                        <span>{a.veryHelpful} (4/4)</span>
                    </span>
                );
            case "HELPFUL":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 size={12} />
                        <span>{a.helpful} (3/4)</span>
                    </span>
                );
            case "SOME_CHANGE":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                        <AlertTriangle size={12} />
                        <span>{a.someChange} (2/4)</span>
                    </span>
                );
            case "NOT_HELPFUL":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full border border-danger/30 bg-danger/10 px-2.5 py-0.5 text-xs font-bold text-danger">
                        <AlertTriangle size={12} />
                        <span>{a.notHelpful} (1/4)</span>
                    </span>
                );
        }
    };

    return (
        <Modal open onClose={onClose} labelledBy="feedback-history-title" size="lg">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-line/60 px-5 pb-4 pt-3 sm:p-6">
                <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                        <History size={15} />
                        <span>{m.title}</span>
                    </div>
                    <h2 id="feedback-history-title" className="text-xl sm:text-2xl font-bold text-foreground">
                        {strategyTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted">{m.sub}</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                    aria-label={m.close}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Filter and stats banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/50 bg-surface-2/40 px-5 py-3 sm:px-6">
                <div className="-mx-5 flex flex-nowrap gap-1.5 overflow-x-auto px-5 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
                    <button
                        type="button"
                        onClick={() => setFilter("all")}
                        className={`h-8 shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition-all ${
                            filter === "all"
                                ? "bg-primary text-white shadow-xs"
                                : "bg-surface text-muted hover:text-foreground hover:bg-surface-2"
                        }`}
                    >
                        {m.allFilter} ({items.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter("completed")}
                        className={`h-8 shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition-all ${
                            filter === "completed"
                                ? "bg-success text-white shadow-xs"
                                : "bg-surface text-muted hover:text-foreground hover:bg-surface-2"
                        }`}
                    >
                        {m.completedFilter} ({completedItems.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter("challenges")}
                        className={`h-8 shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition-all ${
                            filter === "challenges"
                                ? "bg-danger text-white shadow-xs"
                                : "bg-surface text-muted hover:text-foreground hover:bg-surface-2"
                        }`}
                    >
                        {m.challengesFilter} ({challengeItems.length})
                    </button>
                </div>

                <div className="text-xs text-muted">
                    Total intervensi: <strong className="text-foreground">{items.length}</strong>
                </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loading ? (
                    <div className="space-y-3 py-8 text-center text-muted">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="text-sm">Memuat riwayat feedback...</p>
                    </div>
                ) : error ? (
                    <div role="alert" className="rounded-2xl bg-danger/10 p-4 text-sm text-danger font-medium">
                        {error}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="py-12 text-center text-muted space-y-2">
                        <MessageSquare size={32} className="mx-auto text-muted/50" />
                        <p className="text-sm">{m.empty}</p>
                    </div>
                ) : (
                    filteredItems.map((item) => {
                        const dateStr = item.reflectedAt || item.createdAt;
                        const formattedDate = new Date(dateStr).toLocaleDateString(
                            locale === "id" ? "id-ID" : "en-US",
                            {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            },
                        );

                        const reasonLabel = item.reflectionReason
                            ? ((REASON_LABELS_DATA[locale] as Record<string, string>)[item.reflectionReason] ??
                              item.reflectionReason)
                            : null;

                        return (
                            <div
                                key={item.id}
                                className="rounded-2xl border border-line/70 bg-surface/80 p-3.5 sm:p-5 space-y-3.5 transition-all hover:border-primary/40 hover:shadow-xs"
                            >
                                {/* Top: Student, Teacher, Date */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-line/40 pb-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* Student */}
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                                            <GraduationCap size={16} className="text-primary shrink-0" />
                                            <span>
                                                {item.student ? (
                                                    <>
                                                        {item.student.name}
                                                        {item.student.className && (
                                                            <span className="ml-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-normal text-muted">
                                                                {item.student.className}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="italic font-normal text-muted">
                                                        {m.generalClassroom}
                                                    </span>
                                                )}
                                            </span>
                                        </div>

                                        {/* Teacher */}
                                        <div className="flex items-center gap-1.5 text-xs text-muted">
                                            <User size={13} className="mt-0.5 shrink-0 self-start" />
                                            <span>
                                                {m.teacher}:{" "}
                                                <strong className="text-foreground font-medium">
                                                    {item.teacher.name}
                                                </strong>{" "}
                                                <span className="break-all">({item.teacher.email})</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <span className="text-xs text-muted shrink-0">
                                        {item.reflectedAt ? m.reflectedOn : m.appliedOn}: {formattedDate}
                                    </span>
                                </div>

                                {/* Middle: Outcome & Goal */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                                            {m.resultLabel}
                                        </span>
                                        {getOutcomeBadge(item.reflectionResult, item.status)}
                                    </div>

                                    <div className="w-full sm:flex-1 text-xs text-muted">
                                        <span className="font-semibold text-foreground">{m.goal}:</span> {item.goal}
                                    </div>
                                </div>

                                {/* Challenge Reason if present */}
                                {reasonLabel && (
                                    <div className="flex items-center gap-2 rounded-xl border border-danger/25 bg-danger/5 px-3 py-2 text-xs text-danger">
                                        <AlertTriangle size={14} className="shrink-0" />
                                        <span>
                                            <strong>{m.challengeLabel}:</strong> {reasonLabel}
                                        </span>
                                    </div>
                                )}

                                {/* Teacher's Descriptive Note */}
                                {item.reflectionNote && (
                                    <div className="rounded-xl border border-line/60 bg-surface-2/50 p-3 text-xs text-foreground space-y-1">
                                        <span className="font-semibold text-muted text-[11px] block">
                                            💬 {m.notesLabel}:
                                        </span>
                                        <p className="italic leading-relaxed whitespace-pre-wrap">
                                            "{item.reflectionNote}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-line/60 bg-surface p-4 sm:p-5">
                <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                    {m.close}
                </Button>
            </div>
        </Modal>
    );
}
