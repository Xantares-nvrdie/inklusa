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
        <div className="space-y-5 sm:space-y-8">
            <div className="space-y-1.5 sm:space-y-2">
                <h1 className="text-2xl sm:text-4xl font-bold">{t.library.title}</h1>
                <p className="text-sm text-muted sm:text-lg">{t.library.sub}</p>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
                <input
                    id="input-search-library"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t.library.searchPlaceholder}
                    aria-label={t.library.searchLabel}
                    type="search"
                    enterKeyHint="search"
                    className="h-12 w-full rounded-2xl border border-line bg-surface/80 pl-12 pr-12 text-base outline-none glass focus:border-primary focus:ring-4 focus:ring-primary/15 sm:h-14 [&::-webkit-search-cancel-button]:hidden"
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

            <div>
                {/* Category chips scroll edge-to-edge on phones. */}
                <section
                    aria-label={t.library.filterLabel}
                    className="-mx-4 overflow-x-auto px-4 pb-2 pt-1 no-scrollbar sm:mx-0 sm:px-0"
                >
                    <div className="flex w-max min-w-full flex-nowrap items-center gap-2 sm:w-auto sm:flex-wrap">
                        <button
                            id="filter-all"
                            type="button"
                            onClick={() => setCat(null)}
                            aria-pressed={!cat}
                            className={`cursor-pointer h-9 rounded-full border px-4 text-sm font-semibold sm:h-10 transition-colors whitespace-nowrap shrink-0 ${!cat ? "border-primary bg-primary text-white" : "glass border-line bg-surface/80 hover:border-primary"}`}
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
                                className={`inline-flex cursor-pointer items-center gap-2 h-9 rounded-full border px-4 text-sm font-semibold sm:h-10 transition-colors whitespace-nowrap shrink-0 ${cat === c.id ? "border-primary bg-primary text-white" : "glass border-line bg-surface/80 hover:border-primary"}`}
                            >
                                <CategoryIcon icon={c.icon} size={14} /> {c.title}
                            </button>
                        ))}
                        {cat && (
                            <button
                                type="button"
                                onClick={() => setCat(null)}
                                className="inline-flex items-center gap-1 h-9 rounded-full px-3 text-sm font-semibold text-muted sm:h-10 hover:bg-surface-2 hover:text-foreground whitespace-nowrap shrink-0"
                            >
                                <X size={15} aria-hidden="true" /> {t.library.clearFilter}
                            </button>
                        )}
                    </div>
                </section>

                <p className="mb-1 ml-1 mt-3 text-sm font-medium text-muted sm:mb-2 sm:mt-6" aria-live="polite">
                    {t.library.resultCount(list.length)}
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {list.map((i) => {
                    const c = categories.find((x) => x.id === i.category);
                    return (
                        <Link
                            key={i.slug}
                            href={`/interventions/${i.slug}`}
                            id={`lib-${i.slug}`}
                            className="block rounded-[var(--radius-card)]"
                        >
                            <Card
                                interactive
                                className="flex h-full flex-col gap-2.5 border-white/60 p-5 glass sm:gap-3 sm:p-6"
                            >
                                {/* Icon + category side by side on phones to save vertical space. */}
                                <div className="flex items-center gap-3 sm:block">
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-strong sm:h-11 sm:w-11">
                                        {c && <CategoryIcon icon={c.icon} />}
                                    </span>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-primary sm:hidden">
                                        {c?.title}
                                    </p>
                                </div>
                                <h2 className="text-lg font-bold leading-snug sm:text-xl">{i.title}</h2>
                                <p className="line-clamp-3 text-sm text-muted sm:line-clamp-none sm:text-base">
                                    {i.summary}
                                </p>
                                <p className="mt-auto hidden text-xs font-semibold uppercase tracking-wider text-primary sm:block">
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
