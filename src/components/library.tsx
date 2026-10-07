"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { Card } from "@/components/ui/card";
import { useKnowledge } from "@/lib/knowledge-context";
import { useLanguage } from "@/lib/i18n/context";

export function Library() {
    const { t } = useLanguage();
    const { categories, interventions } = useKnowledge();
    const [q, setQ] = useState("");
    const [cat, setCat] = useState<string | null>(null);

    const list = interventions.filter(
        (i) => (!cat || i.category === cat) && (i.title + i.summary).toLowerCase().includes(q.toLowerCase()),
    );

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
                    aria-label="Search interventions"
                    className="h-14 w-full rounded-2xl border border-line bg-surface pl-12 pr-4 text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                />
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
                <button id="filter-all" type="button" onClick={() => setCat(null)} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${!cat ? "border-primary bg-primary text-white" : "border-line bg-surface hover:border-primary"}`}>
                    {t.library.all}
                </button>
                {categories.map((c) => (
                    <button key={c.id} id={`filter-${c.id.toLowerCase()}`} type="button" onClick={() => setCat(c.id)} className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${cat === c.id ? "border-primary bg-primary text-white" : "border-line bg-surface hover:border-primary"}`}>
                        <CategoryIcon icon={c.icon} size={14} /> {c.title}
                    </button>
                ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((i) => {
                    const c = categories.find((x) => x.id === i.category);
                    return (
                        <Link key={i.slug} href={`/interventions/${i.slug}`} id={`lib-${i.slug}`}>
                            <Card interactive className="h-full space-y-3">
                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary-strong">{c && <CategoryIcon icon={c.icon} />}</span>
                                <h2 className="text-xl font-bold">{i.title}</h2>
                                <p className="text-muted">{i.summary}</p>
                                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{c?.title}</p>
                            </Card>
                        </Link>
                    );
                })}
            </div>
            {list.length === 0 && <p className="text-muted">{t.library.noMatch}</p>}
        </div>
    );
}
