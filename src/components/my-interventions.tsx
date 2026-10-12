"use client";

import { ChevronLeft, ChevronRight, Download, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PlanCard } from "@/components/plan-card";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
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
        <div className="w-full max-w-full min-w-0 space-y-5 sm:space-y-8 overflow-hidden">
            <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
                <h1 className="text-2xl sm:text-4xl font-bold">{t.myInterventions.title}</h1>
                <div className="flex w-full items-center gap-2.5 sm:w-auto sm:gap-3">
                    <button
                        type="button"
                        onClick={exportCSV}
                        disabled={!plans || plans.length === 0}
                        className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Download size={16} aria-hidden="true" />
                        {t.myInterventions.exportCSV}
                    </button>
                    <ButtonLink id="btn-new-quick-check" href="/quick-check" className="flex-1 sm:flex-none">
                        <Plus size={16} aria-hidden="true" />
                        <span>{t.myInterventions.btnNew.replace(/^\+\s*/, "")}</span>
                    </ButtonLink>
                </div>
            </div>
            {/* Status chips scroll smoothly on phones without breaking page layout. */}
            <div
                className="w-full overflow-x-auto no-scrollbar pb-1 touch-pan-x"
                style={{ WebkitOverflowScrolling: "touch" }}
            >
                <div className="flex w-max min-w-full flex-nowrap sm:flex-wrap gap-2">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            id={`filter-${f.id}`}
                            type="button"
                            onClick={() => setFilter(f.id)}
                            aria-pressed={filter === f.id}
                            className={`h-9 shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-4 text-xs sm:text-sm font-semibold transition-colors sm:h-10 sm:px-5 ${filter === f.id ? "border-primary bg-primary text-white" : "border-line bg-surface hover:border-primary"}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
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
                        aria-label={t.myInterventions.searchStudent}
                        enterKeyHint="search"
                        className="h-11 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm shadow-xs outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setMobileFilterOpen(true)}
                    aria-haspopup="dialog"
                    className={`relative inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 text-sm font-semibold shadow-xs transition-colors ${
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
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 py-0.5 pl-3 pr-1 text-xs font-medium text-primary">
                            <span className="max-w-40 truncate">
                                {teachers.find((tc) => tc.id === teacher)?.name || t.myInterventions.teacher}
                            </span>
                            <button
                                type="button"
                                onClick={() => setTeacher("")}
                                className="grid h-6 w-6 cursor-pointer place-items-center rounded-full hover:bg-primary/15"
                                aria-label="Hapus filter guru"
                            >
                                <X size={12} aria-hidden="true" />
                            </button>
                        </span>
                    )}
                    {(from || to) && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 py-0.5 pl-3 pr-1 text-xs font-medium text-primary">
                            <span>
                                {from || "..."} — {to || "..."}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setFrom("");
                                    setTo("");
                                }}
                                className="grid h-6 w-6 cursor-pointer place-items-center rounded-full hover:bg-primary/15"
                                aria-label="Hapus filter tanggal"
                            >
                                <X size={12} aria-hidden="true" />
                            </button>
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="ml-1 cursor-pointer px-1 py-1 text-xs font-medium text-muted underline hover:text-danger"
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

            {/* Mobile filter sheet */}
            <Modal open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} labelledBy="mobile-filter-title">
                <ModalHeader onClose={() => setMobileFilterOpen(false)} closeLabel="Tutup filter">
                    <div className="flex flex-wrap items-center gap-2">
                        <SlidersHorizontal size={18} className="text-primary" aria-hidden="true" />
                        <h2 id="mobile-filter-title" className="text-lg font-bold text-foreground">
                            {locale === "id" ? "Filter Intervensi" : "Filter Interventions"}
                        </h2>
                        {activeFilterCount > 0 && (
                            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                                {activeFilterCount} {locale === "id" ? "aktif" : "active"}
                            </span>
                        )}
                    </div>
                </ModalHeader>

                <ModalBody className="space-y-4">
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
                                className={`${inputCls} h-12 w-full pl-9`}
                            />
                        </div>
                    </label>

                    <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
                        {t.myInterventions.teacher}
                        <select
                            id="modal-filter-teacher"
                            value={teacher}
                            onChange={(e) => setTeacher(e.target.value)}
                            className={`${inputCls} h-12 w-full`}
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
                        <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-muted">
                            {t.myInterventions.fromDate}
                            <input
                                id="modal-filter-from"
                                type="date"
                                value={from}
                                max={to || undefined}
                                onChange={(e) => setFrom(e.target.value)}
                                className={`${inputCls} h-12 w-full min-w-0`}
                            />
                        </label>
                        <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-muted">
                            {t.myInterventions.toDate}
                            <input
                                id="modal-filter-to"
                                type="date"
                                value={to}
                                min={from || undefined}
                                onChange={(e) => setTo(e.target.value)}
                                className={`${inputCls} h-12 w-full min-w-0`}
                            />
                        </label>
                    </div>
                </ModalBody>

                <ModalFooter className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={resetFilters}
                        disabled={!hasActiveFilters}
                        className="h-12 cursor-pointer rounded-full border border-line px-5 text-sm font-semibold text-muted hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {t.myInterventions.reset}
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileFilterOpen(false)}
                        className="h-12 flex-1 cursor-pointer rounded-full bg-primary px-5 text-center text-sm font-bold text-white shadow-soft hover:bg-primary-strong"
                    >
                        {locale === "id" ? "Terapkan Filter" : "Apply Filter"}
                    </button>
                </ModalFooter>
            </Modal>
            {error && (
                <p role="alert" className="rounded-2xl bg-[#fbe9e7] px-5 py-4 text-danger">
                    {error}
                </p>
            )}
            {plans === null && !error && (
                <div className="grid w-full max-w-full min-w-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    {[0, 1, 2, 3].map((n) => (
                        <div
                            key={n}
                            className={`h-36 animate-pulse rounded-card bg-surface-2 ${n > 1 ? "hidden md:block" : ""}`}
                        />
                    ))}
                </div>
            )}
            {plans?.length === 0 && (
                <Card className="p-8 text-center text-muted glass border-white/60">{t.myInterventions.empty}</Card>
            )}
            <div className="grid w-full max-w-full min-w-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                {plans?.map((p) => (
                    <PlanCard key={p.id} plan={p} />
                ))}
            </div>
            {data && data.total > 0 && (
                <nav
                    className="flex flex-col-reverse items-center gap-3 border-t border-line/60 pt-5 sm:flex-row sm:justify-between"
                    aria-label="Pagination"
                >
                    <p className="text-xs text-muted sm:text-sm">
                        {t.myInterventions.showingTotal(
                            (page - 1) * data.pageSize + 1,
                            Math.min(page * data.pageSize, data.total),
                            data.total,
                        )}
                    </p>
                    <div className="flex w-full items-center gap-2 sm:w-auto">
                        <button
                            type="button"
                            id="page-prev"
                            disabled={page <= 1}
                            onClick={() => {
                                setPage((p) => p - 1);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-1 rounded-full border border-line bg-surface px-4 text-sm font-semibold hover:border-primary disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:flex-none"
                        >
                            <ChevronLeft size={16} aria-hidden="true" />
                            {t.myInterventions.previous}
                        </button>
                        <span className="min-w-14 text-center text-sm font-semibold tabular-nums">
                            {page} / {totalPages}
                        </span>
                        <button
                            type="button"
                            id="page-next"
                            disabled={page >= totalPages}
                            onClick={() => {
                                setPage((p) => p + 1);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-1 rounded-full border border-line bg-surface px-4 text-sm font-semibold hover:border-primary disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:flex-none"
                        >
                            {t.myInterventions.next}
                            <ChevronRight size={16} aria-hidden="true" />
                        </button>
                    </div>
                </nav>
            )}
        </div>
    );
}
