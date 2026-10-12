"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PlanCard } from "@/components/plan-card";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/context";
import type { PlanRow } from "@/lib/knowledge";

const PAGE_SIZE = 10;

interface BrowseResult {
    items: PlanRow[];
    total: number;
    page: number;
    pageSize: number;
    teachers: { id: string; name: string }[];
}

export function MyInterventions() {
    const { t, locale } = useLanguage();
    const [filter, setFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
    const [data, setData] = useState<BrowseResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [teacher, setTeacher] = useState("");
    const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const activeFilterCount = (search ? 1 : 0) + (teacher ? 1 : 0) + (from ? 1 : 0) + (to ? 1 : 0);

    // Close mobile filter on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMobileFilterOpen(false);
        };
        if (mobileFilterOpen) {
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }
    }, [mobileFilterOpen]);

    const plans = data?.items ?? null;
    const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

    const filters = [
        { id: "all" as const, label: t.myInterventions.filters.all },
        { id: "active" as const, label: t.myInterventions.filters.active },
        { id: "completed" as const, label: t.myInterventions.filters.completed },
        { id: "cancelled" as const, label: t.myInterventions.filters.cancelled },
    ];

    useEffect(() => {
        const h = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(h);
    }, [search]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: reset page when any filter changes
    useEffect(() => {
        setPage(1);
    }, [filter, debouncedSearch, from, to, teacher]);

    useEffect(() => {
        let cancelled = false;
        const q = new URLSearchParams({ filter, page: String(page), pageSize: String(PAGE_SIZE) });
        if (debouncedSearch.trim()) q.set("q", debouncedSearch.trim());
        if (from) q.set("from", from);
        if (to) q.set("to", to);
        if (teacher) q.set("teacher", teacher);
        api<BrowseResult>(`/action-plans/browse?${q.toString()}`)
            .then((r) => {
                if (cancelled) return;
                setData(r);
                setTeachers(r.teachers);
                setError(null);
            })
            .catch((e) => !cancelled && setError(e.message));
        return () => {
            cancelled = true;
        };
    }, [filter, page, debouncedSearch, from, to, teacher]);

    const hasActiveFilters = !!(search || from || to || teacher);
    const resetFilters = () => {
        setSearch("");
        setFrom("");
        setTo("");
        setTeacher("");
    };

    const inputCls = "rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-primary";

    const exportCSV = () => {
        if (!plans) return;
        const headers = [
            "ID",
            "Student",
            "Barrier",
            "Intervention",
            "Status",
            "Goal",
            "Reflection Result",
            "Created At",
        ];
        const rows = plans.map((p) => [
            p.id,
            p.student?.name || "General Classroom",
            `"${p.barrierTitle.replace(/"/g, '""')}"`,
            p.interventionSlug,
            p.status,
            `"${p.goal.replace(/"/g, '""')}"`,
            p.reflectionResult || "",
            new Date(p.createdAt).toISOString(),
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `inklusa-export-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <h1 className="text-2xl sm:text-4xl font-bold">{t.myInterventions.title}</h1>
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <button
                        type="button"
                        onClick={exportCSV}
                        disabled={!plans || plans.length === 0}
                        className="px-3.5 sm:px-4 py-2 font-semibold text-xs sm:text-sm border border-line rounded-xl hover:border-primary transition-colors disabled:opacity-50"
                    >
                        {t.myInterventions.exportCSV}
                    </button>
                    <ButtonLink id="btn-new-quick-check" href="/quick-check">
                        {t.myInterventions.btnNew}
                    </ButtonLink>
                </div>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar flex-nowrap pb-1 sm:flex-wrap">
                {filters.map((f) => (
                    <button
                        key={f.id}
                        id={`filter-${f.id}`}
                        type="button"
                        onClick={() => setFilter(f.id)}
                        className={`cursor-pointer rounded-full border px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${filter === f.id ? "border-primary bg-primary text-white" : "border-line bg-surface hover:border-primary"}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
            {/* Mobile Filter Trigger Bar */}
            <div className="flex sm:hidden items-center gap-2">
                <div className="relative flex-1">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                        aria-hidden="true"
                    />
                    <input
                        id="filter-search-mobile"
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t.myInterventions.searchStudentPlaceholder}
                        className="w-full rounded-xl border border-line bg-surface pl-9 pr-3 py-2 text-sm outline-none focus:border-primary shadow-xs"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setMobileFilterOpen(true)}
                    className={`relative inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors shrink-0 shadow-xs cursor-pointer ${
                        activeFilterCount > 0
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-line bg-surface text-foreground hover:border-primary"
                    }`}
                >
                    <SlidersHorizontal size={16} aria-hidden="true" />
                    <span>Filter</span>
                    {activeFilterCount > 0 && (
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Active filters chip list on mobile */}
            {hasActiveFilters && (
                <div className="flex sm:hidden flex-wrap items-center gap-1.5">
                    {teacher && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs text-primary font-medium">
                            <span>{teachers.find((tc) => tc.id === teacher)?.name || t.myInterventions.teacher}</span>
                            <button
                                type="button"
                                onClick={() => setTeacher("")}
                                className="cursor-pointer hover:opacity-70"
                                aria-label="Hapus filter guru"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}
                    {(from || to) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs text-primary font-medium">
                            <span>
                                {from || "..."} — {to || "..."}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setFrom("");
                                    setTo("");
                                }}
                                className="cursor-pointer hover:opacity-70"
                                aria-label="Hapus filter tanggal"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="text-xs text-muted hover:text-danger underline font-medium cursor-pointer ml-1"
                    >
                        {t.myInterventions.reset}
                    </button>
                </div>
            )}

            {/* Desktop Filters Bar */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:flex lg:flex-wrap items-end gap-3">
                <label className="flex w-full sm:min-w-52 lg:flex-1 flex-col gap-1 text-xs font-semibold text-muted">
                    {t.myInterventions.searchStudent}
                    <input
                        id="filter-search"
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t.myInterventions.searchStudentPlaceholder}
                        className={inputCls}
                    />
                </label>
                <label className="flex w-full sm:w-auto flex-col gap-1 text-xs font-semibold text-muted">
                    {t.myInterventions.teacher}
                    <select
                        id="filter-teacher"
                        value={teacher}
                        onChange={(e) => setTeacher(e.target.value)}
                        className={inputCls}
                    >
                        <option value="">{t.myInterventions.allTeachers}</option>
                        {teachers.map((tc) => (
                            <option key={tc.id} value={tc.id}>
                                {tc.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="flex w-full sm:w-auto flex-col gap-1 text-xs font-semibold text-muted">
                    {t.myInterventions.fromDate}
                    <input
                        id="filter-from"
                        type="date"
                        value={from}
                        max={to || undefined}
                        onChange={(e) => setFrom(e.target.value)}
                        className={inputCls}
                    />
                </label>
                <label className="flex w-full sm:w-auto flex-col gap-1 text-xs font-semibold text-muted">
                    {t.myInterventions.toDate}
                    <input
                        id="filter-to"
                        type="date"
                        value={to}
                        min={from || undefined}
                        onChange={(e) => setTo(e.target.value)}
                        className={inputCls}
                    />
                </label>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:border-primary w-full sm:w-auto"
                    >
                        {t.myInterventions.reset}
                    </button>
                )}
            </div>

            {/* Mobile Filter Modal / Pop-Up */}
            {mobileFilterOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="mobile-filter-title"
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                >
                    <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl border border-line/80 bg-surface shadow-2xl glass overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-line/60 px-5 py-4 bg-surface/90">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal size={18} className="text-primary" />
                                <h2 id="mobile-filter-title" className="text-base font-bold text-foreground">
                                    {locale === "id" ? "Filter Intervensi" : "Filter Interventions"}
                                </h2>
                                {activeFilterCount > 0 && (
                                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                                        {activeFilterCount} {locale === "id" ? "aktif" : "active"}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setMobileFilterOpen(false)}
                                className="cursor-pointer rounded-full p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
                                aria-label="Tutup filter"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
                                {t.myInterventions.searchStudent}
                                <div className="relative">
                                    <Search
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                                        aria-hidden="true"
                                    />
                                    <input
                                        id="modal-filter-search"
                                        type="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={t.myInterventions.searchStudentPlaceholder}
                                        className={`${inputCls} w-full pl-9`}
                                    />
                                </div>
                            </label>

                            <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
                                {t.myInterventions.teacher}
                                <select
                                    id="modal-filter-teacher"
                                    value={teacher}
                                    onChange={(e) => setTeacher(e.target.value)}
                                    className={`${inputCls} w-full`}
                                >
                                    <option value="">{t.myInterventions.allTeachers}</option>
                                    {teachers.map((tc) => (
                                        <option key={tc.id} value={tc.id}>
                                            {tc.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
                                    {t.myInterventions.fromDate}
                                    <input
                                        id="modal-filter-from"
                                        type="date"
                                        value={from}
                                        max={to || undefined}
                                        onChange={(e) => setFrom(e.target.value)}
                                        className={`${inputCls} w-full`}
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
                                    {t.myInterventions.toDate}
                                    <input
                                        id="modal-filter-to"
                                        type="date"
                                        value={to}
                                        min={from || undefined}
                                        onChange={(e) => setTo(e.target.value)}
                                        className={`${inputCls} w-full`}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-line/60 p-4 bg-surface flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={resetFilters}
                                disabled={!hasActiveFilters}
                                className="cursor-pointer rounded-xl border border-line px-4 py-2.5 text-xs font-semibold hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed text-muted hover:text-foreground"
                            >
                                {t.myInterventions.reset}
                            </button>
                            <button
                                type="button"
                                onClick={() => setMobileFilterOpen(false)}
                                className="cursor-pointer rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover flex-1 text-center"
                            >
                                {locale === "id" ? "Terapkan Filter" : "Apply Filter"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {error && (
                <p role="alert" className="rounded-2xl bg-[#fbe9e7] px-5 py-4 text-danger">
                    {error}
                </p>
            )}
            {plans === null && !error && <div className="h-28 animate-pulse rounded-card bg-surface-2" />}
            {plans?.length === 0 && <Card className="text-center text-muted">{t.myInterventions.empty}</Card>}
            <div className="grid gap-4 md:grid-cols-2">
                {plans?.map((p) => (
                    <PlanCard key={p.id} plan={p} />
                ))}
            </div>
            {data && data.total > 0 && (
                <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Pagination">
                    <p className="text-sm text-muted">
                        {t.myInterventions.showingTotal(
                            (page - 1) * data.pageSize + 1,
                            page * data.pageSize,
                            data.total,
                        )}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            id="page-prev"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {t.myInterventions.previous}
                        </button>
                        <span className="text-sm font-semibold">
                            {page} / {totalPages}
                        </span>
                        <button
                            type="button"
                            id="page-next"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {t.myInterventions.next}
                        </button>
                    </div>
                </nav>
            )}
        </div>
    );
}
