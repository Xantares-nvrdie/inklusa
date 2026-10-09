"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/context";
import { useKnowledge } from "@/lib/knowledge-context";

export function Library() {
    const { t } = useLanguage();
    const { categories, interventions } = useKnowledge();
    const [q, setQ] = useState("");
    const [cat, setCat] = useState<string | null>(null);

    const list = interventions.filter((i) => {
        const category = categories.find((c) => c.id === i.category);
        const searchable = [i.title, i.summary, i.why, i.observe, i.steps.join(" "), category?.title ?? ""]
            .join(" ")
            .toLowerCase();
        return (!cat || i.category === cat) && searchable.includes(q.trim().toLowerCase());
    });

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold">{t.library.title}</h1>
                <p className="text-lg text-muted">{t.library.sub}</p>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
                <input
                    id="input-search-library"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t.library.searchPlaceholder}
                    aria-label={t.library.searchLabel}
                    className="h-14 w-full rounded-2xl border border-line bg-surface/80 glass pl-12 pr-12 text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                />
                {q && (
                    <button
                        type="button"
                        onClick={() => setQ("")}
                        className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-foreground"
                        aria-label={t.library.clearSearch}
                        title={t.library.clearSearch}
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                )}
            </div>

            <fieldset className="m-0 flex flex-wrap items-center gap-2 border-0 p-0">
                <legend className="sr-only">{t.library.filterLabel}</legend>
                <button
                    id="filter-all"
                    type="button"
                    onClick={() => setCat(null)}
                    aria-pressed={!cat}
                    className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${!cat ? "border-primary bg-primary text-white" : "glass border-line bg-surface/80 hover:border-primary"}`}
                >
                    {t.library.all}
                </button>
                {categories.map((c) => (
                    <button
                        key={c.id}
                        id={`filter-${c.id.toLowerCase()}`}
                        type="button"
                        onClick={() => setCat(c.id)}
                        aria-pressed={cat === c.id}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${cat === c.id ? "border-primary bg-primary text-white" : "glass border-line bg-surface/80 hover:border-primary"}`}
                    >
                        <CategoryIcon icon={c.icon} size={14} /> {c.title}
                    </button>
                ))}
                {cat && (
                    <button
                        type="button"
                        onClick={() => setCat(null)}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-foreground"
                    >
                        <X size={15} aria-hidden="true" /> {t.library.clearFilter}
                    </button>
                )}
            </fieldset>

            <p className="-mt-4 text-sm font-medium text-muted" aria-live="polite">
                {t.library.resultCount(list.length)}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((i) => {
                    const c = categories.find((x) => x.id === i.category);
                    return (
                        <Link key={i.slug} href={`/interventions/${i.slug}`} id={`lib-${i.slug}`}>
                            <Card interactive className="h-full space-y-3 glass border-white/60">
                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary-strong">
                                    {c && <CategoryIcon icon={c.icon} />}
                                </span>
                                <h2 className="text-xl font-bold">{i.title}</h2>
                                <p className="text-muted">{i.summary}</p>
                                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                                    {c?.title}
                                </p>
                            </Card>
                        </Link>
                    );
                })}
            </div>
            {list.length === 0 && (
                <Card className="border-dashed bg-surface/50 py-10 text-center text-muted">{t.library.noMatch}</Card>
            )}
        </div>
    );
}
