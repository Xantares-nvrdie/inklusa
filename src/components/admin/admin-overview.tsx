"use client";

import { BookMarked, ClipboardList, GraduationCap, ListTree } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { adminDict } from "@/lib/i18n/admin";
import { useLanguage } from "@/lib/i18n/context";
import { RESULT_LABELS_DATA } from "@/lib/knowledge";
import { useKnowledge } from "@/lib/knowledge-context";

interface Row {
    key: string | null;
    n: number;
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
