"use client";

import { Download, Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { adminDict } from "@/lib/i18n/admin";
import { useLanguage } from "@/lib/i18n/context";
import {
    type BarrierCategory,
    CATEGORIES_DATA,
    type KnowledgeClarification,
    type LocalizedIntervention,
} from "@/lib/knowledge";
import { useKnowledge } from "@/lib/knowledge-context";

type AdminIntervention = LocalizedIntervention & { isActive: boolean };
type AdminClarification = KnowledgeClarification & { isActive: boolean };
type Bi = { en: string; id: string };

const inputCls =
    "w-full rounded-2xl border border-line bg-surface px-4 py-3 text-[0.95rem] outline-none focus:border-primary focus:ring-4 focus:ring-primary/15";

function BiField({
    label,
    value,
    onChange,
    rows,
    idPrefix,
}: {
    label: string;
    value: Bi;
    onChange: (v: Bi) => void;
    rows?: number;
    idPrefix: string;
}) {
    const Tag = rows ? "textarea" : "input";
    return (
        <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">{label}</legend>
            <div className="grid gap-3 md:grid-cols-2">
                {(["en", "id"] as const).map((l) => (
                    <div key={l} className="relative">
                        <span className="absolute right-3 top-2 z-10 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase text-muted">
                            {l}
                        </span>
                        <Tag
                            id={`${idPrefix}-${l}`}
                            aria-label={`${label} (${l.toUpperCase()})`}
                            rows={rows}
                            value={value[l]}
                            onChange={(e) => onChange({ ...value, [l]: e.target.value })}
                            className={`${inputCls} ${rows ? "pt-7" : "h-12 py-0 pr-12"}`}
                        />
                    </div>
                ))}
            </div>
        </fieldset>
    );
}

const CategorySelect = ({
    value,
    onChange,
    label,
}: {
    value: BarrierCategory;
    onChange: (v: BarrierCategory) => void;
    label: string;
}) => {
    const { locale } = useLanguage();
    return (
        <div className="space-y-2">
            <label htmlFor="kb-category" className="text-sm font-semibold">
                {label}
            </label>
            <select
                id="kb-category"
                value={value}
                onChange={(e) => onChange(e.target.value as BarrierCategory)}
                className={`${inputCls} h-12 py-0`}
            >
                {CATEGORIES_DATA.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.title[locale]}
                    </option>
                ))}
            </select>
        </div>
    );
};

// ─── Strategy editor ──────────────────────────────────────────────────────────

interface IvForm {
    isNew: boolean;
    slug: string;
    category: BarrierCategory;
    title: Bi;
    summary: Bi;
    why: Bi;
    steps: Bi;
    observe: Bi;
    isActive: boolean;
}
const emptyBi = (): Bi => ({ en: "", id: "" });
const emptyIv = (): IvForm => ({
    isNew: true,
    slug: "",
    category: "INSTRUCTION",
    title: emptyBi(),
    summary: emptyBi(),
    why: emptyBi(),
    steps: emptyBi(),
    observe: emptyBi(),
    isActive: true,
});
const toIvForm = (i: AdminIntervention): IvForm => ({
    isNew: false,
    slug: i.slug,
    category: i.category,
    title: i.title,
    summary: i.summary,
    why: i.why,
    steps: { en: i.steps.en.join("\n"), id: i.steps.id.join("\n") },
    observe: i.observe,
    isActive: i.isActive,
});
const lines = (s: string) =>
    s
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);

function StrategyEditor({
    form,
    setForm,
    onSave,
    onCancel,
    saving,
    error,
}: {
    form: IvForm;
    setForm: (f: IvForm) => void;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
    error: string | null;
}) {
    const { locale } = useLanguage();
    const k = adminDict[locale].kb;
    return (
        <Card className="space-y-5 border-white/60 p-7 shadow-lift glass">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{form.isNew ? k.newStrategy : k.edit}</h2>
                <button
                    type="button"
                    onClick={onCancel}
                    className="cursor-pointer rounded-full p-2 text-muted hover:bg-surface-2"
                    aria-label={k.cancel}
                >
                    <X size={18} />
                </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="kb-slug" className="text-sm font-semibold">
                        {k.slug}
                    </label>
                    <input
                        id="kb-slug"
                        value={form.slug}
                        disabled={!form.isNew}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        placeholder="visual-checklist"
                        className={`${inputCls} h-12 py-0 disabled:opacity-60`}
                    />
                </div>
                <CategorySelect
                    label={k.category}
                    value={form.category}
                    onChange={(category) => setForm({ ...form, category })}
                />
            </div>
            <BiField
                idPrefix="kb-title"
                label={k.titleF}
                value={form.title}
                onChange={(title) => setForm({ ...form, title })}
            />
            <BiField
                idPrefix="kb-summary"
                label={k.summary}
                value={form.summary}
                onChange={(summary) => setForm({ ...form, summary })}
            />
            <BiField
                idPrefix="kb-why"
                label={k.why}
                rows={2}
                value={form.why}
                onChange={(why) => setForm({ ...form, why })}
            />
            <BiField
                idPrefix="kb-steps"
                label={k.steps}
                rows={5}
                value={form.steps}
                onChange={(steps) => setForm({ ...form, steps })}
            />
            <BiField
                idPrefix="kb-observe"
                label={k.observe}
                rows={2}
                value={form.observe}
                onChange={(observe) => setForm({ ...form, observe })}
            />
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-5 w-5 accent-[var(--primary)]"
                />
                {k.visible}
            </label>
            {error && (
                <p role="alert" className="rounded-xl bg-[#fbe9e7] px-4 py-3 text-sm text-danger">
                    {error}
                </p>
            )}
            <div className="flex gap-3">
                <Button id="btn-kb-save" onClick={onSave} disabled={saving}>
                    {saving ? k.saving : k.save}
                </Button>
                <Button variant="ghost" onClick={onCancel}>
                    {k.cancel}
                </Button>
            </div>
        </Card>
    );
}

// ─── Rule editor ──────────────────────────────────────────────────────────────

interface ClForm {
    isNew: boolean;
    id: string;
    category: BarrierCategory;
    label: Bi;
    barrier: Bi;
    insight: Bi;
    supports: { slug: string; reason: Bi }[];
    isActive: boolean;
}
const emptyCl = (): ClForm => ({
    isNew: true,
    id: "",
    category: "INSTRUCTION",
    label: emptyBi(),
    barrier: emptyBi(),
    insight: emptyBi(),
    supports: [{ slug: "", reason: emptyBi() }],
    isActive: true,
});
const toClForm = (c: AdminClarification): ClForm => ({
    isNew: false,
    id: c.id,
    category: c.category,
    label: c.label,
    barrier: c.barrier,
    insight: c.insight,
    supports: c.supports,
    isActive: c.isActive,
});

function RuleEditor({
    form,
    setForm,
    onSave,
    onCancel,
    saving,
    error,
    strategies,
}: {
    form: ClForm;
    setForm: (f: ClForm) => void;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
    error: string | null;
    strategies: AdminIntervention[];
}) {
    const { locale } = useLanguage();
    const k = adminDict[locale].kb;
    const setSupport = (idx: number, patch: Partial<ClForm["supports"][number]>) =>
        setForm({ ...form, supports: form.supports.map((s, i) => (i === idx ? { ...s, ...patch } : s)) });

    return (
        <Card className="space-y-5 border-white/60 p-7 shadow-lift glass">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{form.isNew ? k.newRule : k.edit}</h2>
                <button
                    type="button"
                    onClick={onCancel}
                    className="cursor-pointer rounded-full p-2 text-muted hover:bg-surface-2"
                    aria-label={k.cancel}
                >
                    <X size={18} />
                </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="kb-id" className="text-sm font-semibold">
                        {k.slug}
                    </label>
                    <input
                        id="kb-id"
                        value={form.id}
                        disabled={!form.isNew}
                        onChange={(e) => setForm({ ...form, id: e.target.value })}
                        placeholder="multi-step"
                        className={`${inputCls} h-12 py-0 disabled:opacity-60`}
                    />
                </div>
                <CategorySelect
                    label={k.category}
                    value={form.category}
                    onChange={(category) => setForm({ ...form, category })}
                />
            </div>
            <BiField
                idPrefix="kb-label"
                label={k.label}
                value={form.label}
                onChange={(label) => setForm({ ...form, label })}
            />
            <BiField
                idPrefix="kb-barrier"
                label={k.barrier}
                value={form.barrier}
                onChange={(barrier) => setForm({ ...form, barrier })}
            />
            <BiField
                idPrefix="kb-insight"
                label={k.insight}
                rows={2}
                value={form.insight}
                onChange={(insight) => setForm({ ...form, insight })}
            />

            <div className="space-y-3">
                <p className="text-sm font-semibold">{k.supports}</p>
                {form.supports.map((s, idx) => (
                    <div key={`${idx}-${s.slug}`} className="space-y-3 rounded-2xl bg-surface-2/70 p-4">
                        <div className="flex items-center gap-3">
                            <select
                                aria-label={k.strategy}
                                value={s.slug}
                                onChange={(e) => setSupport(idx, { slug: e.target.value })}
                                className={`${inputCls} h-12 py-0`}
                            >
                                <option value="">— {k.strategy} —</option>
                                {strategies.map((i) => (
                                    <option key={i.slug} value={i.slug}>
                                        {i.title[locale]}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                aria-label={k.del}
                                onClick={() =>
                                    setForm({ ...form, supports: form.supports.filter((_, i) => i !== idx) })
                                }
                                className="cursor-pointer rounded-full p-2 text-muted hover:bg-surface"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <BiField
                            idPrefix={`kb-reason-${idx}`}
                            label={k.reason}
                            value={s.reason}
                            onChange={(reason) => setSupport(idx, { reason })}
                        />
                    </div>
                ))}
                {form.supports.length < 5 && (
                    <Button
                        type="button"
                        size="sm"
                        variant="soft"
                        onClick={() =>
                            setForm({ ...form, supports: [...form.supports, { slug: "", reason: emptyBi() }] })
                        }
                    >
                        <Plus size={14} aria-hidden="true" /> {k.addSupport}
                    </Button>
                )}
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-5 w-5 accent-[var(--primary)]"
                />
                {k.visible}
            </label>
            {error && (
                <p role="alert" className="rounded-xl bg-[#fbe9e7] px-4 py-3 text-sm text-danger">
                    {error}
                </p>
            )}
            <div className="flex gap-3">
                <Button id="btn-kb-save" onClick={onSave} disabled={saving}>
                    {saving ? k.saving : k.save}
                </Button>
                <Button variant="ghost" onClick={onCancel}>
                    {k.cancel}
                </Button>
            </div>
        </Card>
    );
}

// ─── Manager ──────────────────────────────────────────────────────────────────

export function KnowledgeManager() {
    const { locale } = useLanguage();
    const k = adminDict[locale].kb;
    const { refresh, categories } = useKnowledge();
    const [tab, setTab] = useState<"strategies" | "rules">("strategies");
    const [ivs, setIvs] = useState<AdminIntervention[] | null>(null);
    const [cls, setCls] = useState<AdminClarification[] | null>(null);
    const [ivForm, setIvForm] = useState<IvForm | null>(null);
    const [clForm, setClForm] = useState<ClForm | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("ALL");
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const load = useCallback(async () => {
        const [a, b] = await Promise.all([
            api<AdminIntervention[]>("/admin/knowledge/interventions"),
            api<AdminClarification[]>("/admin/knowledge/clarifications"),
        ]);
        setIvs(a);
        setCls(b);
        refresh();
    }, [refresh]);
    useEffect(() => {
        load().catch((e) => setError(e.message));
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [search, filterCategory, tab]);

    const catName = (id: string) => categories.find((c) => c.id === id)?.title ?? id;

    async function importDefaults() {
        const r = await api<{ interventions: number; clarifications: number }>("/admin/knowledge/import-defaults", {
            method: "POST",
        });
        setNotice(`${k.imported}: ${r.interventions} + ${r.clarifications}`);
        await load();
    }

    async function saveIv() {
        if (!ivForm) return;
        setSaving(true);
        setError(null);
        const { isNew, slug, steps, ...rest } = ivForm;
        const body = { ...rest, steps: { en: lines(steps.en), id: lines(steps.id) } };
        try {
            if (isNew)
                await api("/admin/knowledge/interventions", {
                    method: "POST",
                    body: JSON.stringify({ slug, ...body }),
                });
            else await api(`/admin/knowledge/interventions/${slug}`, { method: "PUT", body: JSON.stringify(body) });
            setIvForm(null);
            await load();
        } catch (e) {
            setError(friendly((e as Error).message));
        } finally {
            setSaving(false);
        }
    }

    async function saveCl() {
        if (!clForm) return;
        setSaving(true);
        setError(null);
        const { isNew, id, ...body } = clForm;
        try {
            if (isNew)
                await api("/admin/knowledge/clarifications", { method: "POST", body: JSON.stringify({ id, ...body }) });
            else await api(`/admin/knowledge/clarifications/${id}`, { method: "PUT", body: JSON.stringify(body) });
            setClForm(null);
            await load();
        } catch (e) {
            setError(friendly((e as Error).message));
        } finally {
            setSaving(false);
        }
    }

    async function toggle(kind: "interventions" | "clarifications", key: string, isActive: boolean) {
        await api(`/admin/knowledge/${kind}/${key}/active`, { method: "PATCH", body: JSON.stringify({ isActive }) });
        await load();
    }
    async function remove(kind: "interventions" | "clarifications", key: string) {
        if (!window.confirm(k.confirmDelete)) return;
        await api(`/admin/knowledge/${kind}/${key}`, { method: "DELETE" });
        await load();
    }

    const tabCls = (on: boolean) =>
        `cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-colors ${on ? "bg-primary text-white" : "bg-surface border border-line hover:border-primary"}`;

    const empty = ivs?.length === 0 && cls?.length === 0;

    const filteredIvs = (ivs || []).filter((i) => {
        if (filterCategory !== "ALL" && i.category !== filterCategory) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                i.title[locale].toLowerCase().includes(q) ||
                i.slug.toLowerCase().includes(q) ||
                i.summary[locale].toLowerCase().includes(q)
            );
        }
        return true;
    });

    const filteredCls = (cls || []).filter((c) => {
        if (filterCategory !== "ALL" && c.category !== filterCategory) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                c.barrier[locale].toLowerCase().includes(q) ||
                c.label[locale].toLowerCase().includes(q) ||
                c.id.toLowerCase().includes(q)
            );
        }
        return true;
    });

    const activeList = tab === "strategies" ? filteredIvs : filteredCls;
    const totalItems = activeList.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const paginatedIvs = filteredIvs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const paginatedCls = filteredCls.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold">{k.title}</h1>
                    <p className="max-w-2xl text-lg text-muted">{k.sub}</p>
                </div>
                <Button id="btn-import-defaults" variant="outline" onClick={importDefaults}>
                    <Download size={16} aria-hidden="true" /> {k.importDefaults}
                </Button>
            </div>
            {notice && (
                <p className="rounded-2xl bg-primary-soft px-5 py-3 text-sm font-medium text-primary-strong">
                    {notice}
                </p>
            )}
            {error && !ivForm && !clForm && (
                <p role="alert" className="rounded-2xl bg-[#fbe9e7] px-5 py-4 text-danger">
                    {error}
                </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2" role="tablist">
                    <button
                        id="tab-strategies"
                        role="tab"
                        aria-selected={tab === "strategies"}
                        onClick={() => setTab("strategies")}
                        className={tabCls(tab === "strategies")}
                    >
                        {k.tabStrategies} ({ivs?.length ?? 0})
                    </button>
                    <button
                        id="tab-rules"
                        role="tab"
                        aria-selected={tab === "rules"}
                        onClick={() => setTab("rules")}
                        className={tabCls(tab === "rules")}
                    >
                        {k.tabRules} ({cls?.length ?? 0})
                    </button>
                </div>
                {tab === "strategies" ? (
                    <Button
                        id="btn-new-strategy"
                        onClick={() => {
                            setError(null);
                            setIvForm(emptyIv());
                        }}
                    >
                        <Plus size={16} aria-hidden="true" /> {k.newStrategy}
                    </Button>
                ) : (
                    <Button
                        id="btn-new-rule"
                        onClick={() => {
                            setError(null);
                            setClForm(emptyCl());
                        }}
                    >
                        <Plus size={16} aria-hidden="true" /> {k.newRule}
                    </Button>
                )}
            </div>

            {tab === "strategies" && ivForm && (
                <StrategyEditor
                    form={ivForm}
                    setForm={setIvForm}
                    onSave={saveIv}
                    onCancel={() => setIvForm(null)}
                    saving={saving}
                    error={error}
                />
            )}
            {tab === "rules" && clForm && (
                <RuleEditor
                    form={clForm}
                    setForm={setClForm}
                    onSave={saveCl}
                    onCancel={() => setClForm(null)}
                    saving={saving}
                    error={error}
                    strategies={ivs ?? []}
                />
            )}

            <div className="flex flex-col gap-4 rounded-2xl bg-surface-2 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex w-full flex-wrap items-center gap-3 md:flex-nowrap">
                    <input
                        type="text"
                        placeholder={k.search}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={inputCls + " w-full md:max-w-sm"}
                    />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className={inputCls + " w-full md:max-w-xs"}
                    >
                        <option value="ALL">— {k.allCategories} —</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {empty && <Card className="text-center text-muted glass border-white/60">{k.empty}</Card>}

            {tab === "strategies" && (
                <div className="grid gap-3">
                    {paginatedIvs.map((i) => {
                        const used = cls?.filter((c) => c.supports.some((s) => s.slug === i.slug)).length ?? 0;
                        return (
                            <Card
                                key={i.slug}
                                className="flex flex-col gap-4 md:flex-row md:items-center glass border-white/60"
                            >
                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-bold">{i.title[locale]}</h2>
                                        <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-strong">
                                            {catName(i.category)}
                                        </span>
                                        {!i.isActive && (
                                            <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted">
                                                {k.hidden}
                                            </span>
                                        )}
                                    </div>
                                    <p className="truncate text-sm text-muted">{i.summary[locale]}</p>
                                    <p className="text-xs text-muted">
                                        {i.slug} · {i.steps[locale].length} {k.stepsCount} · {k.usedBy}: {used}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        aria-label={i.isActive ? k.hidden : k.active}
                                        onClick={() => toggle("interventions", i.slug, !i.isActive)}
                                    >
                                        {i.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </Button>
                                    <Button
                                        id={`btn-edit-${i.slug}`}
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setError(null);
                                            setIvForm(toIvForm(i));
                                        }}
                                    >
                                        <Pencil size={14} aria-hidden="true" /> {k.edit}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        aria-label={k.del}
                                        onClick={() => remove("interventions", i.slug)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {tab === "rules" && (
                <div className="grid gap-3">
                    {paginatedCls.map((c) => (
                        <Card
                            key={c.id}
                            className="flex flex-col gap-4 md:flex-row md:items-center glass border-white/60"
                        >
                            <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-bold">{c.barrier[locale]}</h2>
                                    <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-strong">
                                        {catName(c.category)}
                                    </span>
                                    {!c.isActive && (
                                        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted">
                                            {k.hidden}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted">{c.label[locale]}</p>
                                <p className="text-xs text-muted">
                                    {c.id} →{" "}
                                    {c.supports
                                        .map((s) => ivs?.find((i) => i.slug === s.slug)?.title[locale] ?? s.slug)
                                        .join(" · ")}
                                </p>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    aria-label={c.isActive ? k.hidden : k.active}
                                    onClick={() => toggle("clarifications", c.id, !c.isActive)}
                                >
                                    {c.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                </Button>
                                <Button
                                    id={`btn-edit-${c.id}`}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setError(null);
                                        setClForm(toClForm(c));
                                    }}
                                >
                                    <Pencil size={14} aria-hidden="true" /> {k.edit}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    aria-label={k.del}
                                    onClick={() => remove("clarifications", c.id)}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {totalItems > 0 && (
                <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
                    <p className="text-sm text-muted">
                        {k.pageOf.replace("{current}", String(page)).replace("{total}", String(totalPages))}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            {k.previous}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                            {k.next}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function friendly(msg: string) {
    return msg.length > 300 ? "Please complete all English and Indonesian fields (steps: 3–6 lines)." : msg;
}
