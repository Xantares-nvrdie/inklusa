"use client";

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
    const { t } = useLanguage();
    const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
    const [data, setData] = useState<BrowseResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [teacher, setTeacher] = useState("");
    const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);

    const plans = data?.items ?? null;
    const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

    const filters = [
        { id: "all" as const, label: t.myInterventions.filters.all },
        { id: "active" as const, label: t.myInterventions.filters.active },
        { id: "completed" as const, label: t.myInterventions.filters.completed },
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

    const inputCls =
        "rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-primary";

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
                <h1 className="text-4xl font-bold">{t.myInterventions.title}</h1>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={exportCSV}
                        disabled={!plans || plans.length === 0}
                        className="px-4 py-2 font-semibold text-sm border border-line rounded-xl hover:border-primary transition-colors disabled:opacity-50"
                    >
                        {t.myInterventions.exportCSV}
                    </button>
                    <ButtonLink id="btn-new-quick-check" href="/quick-check">
                        {t.myInterventions.btnNew}
                    </ButtonLink>
                </div>
            </div>
            <div className="flex gap-2" role="group" aria-label="Filter">
                {filters.map((f) => (
                    <button
                        key={f.id}
                        id={`filter-${f.id}`}
                        type="button"
                        onClick={() => setFilter(f.id)}
                        className={`cursor-pointer rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${filter === f.id ? "border-primary bg-primary text-white" : "border-line bg-surface hover:border-primary"}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap items-end gap-3">
                <label className="flex min-w-52 flex-1 flex-col gap-1 text-xs font-semibold text-muted">
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
                <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
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
                <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
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
                <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
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
                        className="cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:border-primary"
                    >
                        {t.myInterventions.reset}
                    </button>
                )}
            </div>
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
                        {t.myInterventions.showingTotal((page - 1) * data.pageSize + 1, page * data.pageSize, data.total)}
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
