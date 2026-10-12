"use client";

import { Ban, CheckCircle2, Plus, Search, Trash2, UserCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { adminDict } from "@/lib/i18n/admin";
import { useLanguage } from "@/lib/i18n/context";

interface Teacher {
    id: string;
    name: string;
    email: string;
    banned: boolean;
    banReason: string | null;
    createdAt: string;
    students: number;
    plans: number;
    activePlans: number;
}

const inputCls =
    "h-12 w-full rounded-2xl border border-line bg-surface/80 glass px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15";

export function TeachersManager() {
    const { locale } = useLanguage();
    const a = adminDict[locale].teachers;
    const [list, setList] = useState<Teacher[] | null>(null);
    const [q, setQ] = useState("");
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(
        () =>
            api<Teacher[]>("/admin/teachers")
                .then(setList)
                .catch((e) => setError(e.message)),
        [],
    );
    useEffect(() => {
        load();
    }, [load]);

    async function create(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setBusy(true);
        const f = new FormData(e.currentTarget);
        try {
            await api("/admin/teachers", {
                method: "POST",
                body: JSON.stringify({ name: f.get("name"), email: f.get("email"), password: f.get("password") }),
            });
            setAdding(false);
            await load();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setBusy(false);
        }
    }

    async function toggleBan(t: Teacher) {
        const reason = t.banned ? undefined : (window.prompt(a.banReason) ?? undefined);
        if (!t.banned && reason === undefined) return;
        await api(`/admin/teachers/${t.id}/ban`, {
            method: "PATCH",
            body: JSON.stringify({ banned: !t.banned, reason }),
        });
        await load();
    }

    async function remove(t: Teacher) {
        if (!window.confirm(a.confirmDelete)) return;
        await api(`/admin/teachers/${t.id}`, { method: "DELETE" });
        await load();
    }

    const shown = list?.filter((t) => (t.name + t.email).toLowerCase().includes(q.toLowerCase()));

    return (
        <div className="space-y-5 sm:space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                    <h1 className="text-2xl sm:text-4xl font-bold">{a.title}</h1>
                    <p className="text-sm text-muted sm:text-lg">{a.sub}</p>
                </div>
                <Button id="btn-add-teacher" onClick={() => setAdding((v) => !v)} className="w-full sm:w-auto">
                    <Plus size={16} aria-hidden="true" /> {a.add}
                </Button>
            </div>

            {adding && (
                <Card className="space-y-4 border-white/60 p-5 glass animate-pop-in sm:p-6">
                    <form onSubmit={create} className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-1.5">
                            <label htmlFor="t-name" className="text-sm font-medium">
                                {a.name}
                            </label>
                            <input id="t-name" name="name" required className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="t-email" className="text-sm font-medium">
                                {a.email}
                            </label>
                            <input id="t-email" name="email" type="email" required className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="t-pass" className="text-sm font-medium">
                                {a.password}
                            </label>
                            <input
                                id="t-pass"
                                name="password"
                                type="text"
                                required
                                minLength={8}
                                className={inputCls}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:flex md:col-span-3">
                            <Button id="btn-create-teacher" type="submit" disabled={busy}>
                                {a.create}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
                                {a.cancel}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}
            {error && (
                <p role="alert" className="rounded-2xl bg-[#fbe9e7] px-5 py-4 text-danger">
                    {error}
                </p>
            )}

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
                <input
                    id="input-search-teachers"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={a.search}
                    aria-label={a.search}
                    type="search"
                    enterKeyHint="search"
                    className={`${inputCls} pl-12 sm:h-14`}
                />
            </div>

            {list === null && <div className="h-28 animate-pulse rounded-card bg-surface-2" />}
            {shown?.length === 0 && <Card className="text-center text-muted glass border-white/60">{a.empty}</Card>}

            <div className="space-y-3">
                {shown?.map((t) => (
                    <Card
                        key={t.id}
                        className="flex flex-col gap-4 border-white/60 p-4 glass sm:p-6 md:flex-row md:items-center"
                    >
                        <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:gap-4 md:items-center">
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-lg font-bold text-primary-strong sm:h-12 sm:w-12">
                                {t.name.charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <h2 className="min-w-0 break-words text-base font-bold sm:text-lg">{t.name}</h2>
                                    {t.banned ? (
                                        t.banReason === "PENDING_APPROVAL" ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-[#9a5612]">
                                                <UserCheck size={12} aria-hidden="true" />
                                                {a.statusPending}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#fbe9e7] px-2.5 py-0.5 text-xs font-semibold text-danger">
                                                <Ban size={12} aria-hidden="true" />
                                                {a.statusBanned}
                                            </span>
                                        )
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-strong">
                                            <CheckCircle2 size={12} aria-hidden="true" />
                                            {a.statusActive}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted md:truncate">
                                    <span className="block truncate md:inline">{t.email}</span>
                                    <span className="hidden md:inline"> · </span>
                                    <span className="block text-xs md:inline md:text-sm">
                                        {a.joined}{" "}
                                        {new Date(t.createdAt).toLocaleDateString(locale === "id" ? "id-ID" : "en-US")}
                                    </span>
                                </p>
                                {t.banned && t.banReason && t.banReason !== "PENDING_APPROVAL" && (
                                    <p className="text-sm text-danger">{t.banReason}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 divide-x divide-line/60 rounded-2xl bg-surface-2/60 py-2.5 text-center text-sm md:flex md:gap-6 md:divide-x-0 md:bg-transparent md:py-0">
                            <div>
                                <p className="font-display text-xl font-bold">{t.students}</p>
                                <p className="text-xs text-muted md:text-sm">{a.students}</p>
                            </div>
                            <div>
                                <p className="font-display text-xl font-bold">{t.plans}</p>
                                <p className="text-xs text-muted md:text-sm">{a.plans}</p>
                            </div>
                            <div>
                                <p className="font-display text-xl font-bold">{t.activePlans}</p>
                                <p className="text-xs text-muted md:text-sm">{a.active}</p>
                            </div>
                        </div>
                        <div className="flex w-full gap-2 md:w-auto">
                            <Button
                                id={`btn-ban-${t.id}`}
                                size="sm"
                                variant={t.banned ? "soft" : "outline"}
                                onClick={() => toggleBan(t)}
                                className="h-11 flex-1 justify-center md:h-9 md:flex-none"
                            >
                                {t.banned ? (
                                    <UserCheck size={14} aria-hidden="true" />
                                ) : (
                                    <Ban size={14} aria-hidden="true" />
                                )}
                                {t.banned ? (t.banReason === "PENDING_APPROVAL" ? a.approve : a.unban) : a.ban}
                            </Button>
                            <Button
                                id={`btn-delete-${t.id}`}
                                size="sm"
                                variant="ghost"
                                onClick={() => remove(t)}
                                aria-label={a.del}
                                title={a.del}
                                className="h-11 w-11 shrink-0 p-0 text-danger hover:bg-danger/10 hover:text-danger md:h-9 md:w-9"
                            >
                                <Trash2 size={16} aria-hidden="true" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
