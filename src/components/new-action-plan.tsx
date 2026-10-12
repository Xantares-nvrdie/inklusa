"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/context";
import type { PlanRow } from "@/lib/knowledge";
import { useKnowledge } from "@/lib/knowledge-context";

export function NewActionPlan() {
    const router = useRouter();
    const { t } = useLanguage();
    const { getClarification, getIntervention } = useKnowledge();
    const sp = useSearchParams();
    const cat = sp.get("cat") ?? "";
    const clarId = sp.get("clar") ?? "";
    const slug = sp.get("slug") ?? "";
    const studentParam = sp.get("student") ?? "general";

    const clar = getClarification(cat, clarId);
    const iv = getIntervention(slug);

    const [studentLabel, setStudentLabel] = useState(t.dashboard.generalClassroom);
    const [goal, setGoal] = useState("");
    const [timing, setTiming] = useState(t.actionPlan.timings[0]);
    const [saving, setSaving] = useState(false);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState<PlanRow | null>(null);

    useEffect(() => {
        if (studentParam === "general") {
            setStudentLabel(t.dashboard.generalClassroom);
            return;
        }
        api<{ id: string; name: string }[]>("/students").then((l) => {
            const s = l.find((x) => x.id === studentParam);
            if (s) setStudentLabel(s.name);
        });
    }, [studentParam, t]);

    if (!clar || !iv)
        return (
            <Card className="mx-auto max-w-xl text-center glass border-white/60">
                <h1 className="text-2xl font-bold">{t.actionPlan.missingContext}</h1>
            </Card>
        );

    async function save() {
        if (!clar || !iv) return;
        setSaving(true);
        setError(null);
        try {
            const row = await api<PlanRow>("/action-plans", {
                method: "POST",
                body: JSON.stringify({
                    studentId: studentParam === "general" ? null : studentParam,
                    barrierCategory: cat,
                    clarificationId: clarId,
                    barrierTitle: clar.barrier,
                    interventionSlug: iv.slug,
                    goal: goal.trim(),
                    timing,
                }),
            });
            setSaved(row);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSaving(false);
        }
    }

    if (saved) {
        return (
            <Card className="mx-auto max-w-xl space-y-5 border-white/60 p-6 text-center shadow-lift glass sm:space-y-6 sm:p-10">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary animate-pop-in sm:h-16 sm:w-16">
                    <CheckCircle2 size={32} aria-hidden="true" />
                </span>
                <h1 className="text-2xl font-bold sm:text-3xl">{t.actionPlan.createdTitle}</h1>
                <div className="space-y-1 text-muted">
                    <p className="font-semibold text-foreground">{studentLabel}</p>
                    <p>{iv.title}</p>
                    <p>
                        {t.actionPlan.currentStatus}: {t.actionPlan.statusPlanned}
                    </p>
                </div>
                {error && (
                    <p role="alert" className="rounded-xl bg-[#fbe9e7] px-4 py-3 text-sm text-danger">
                        {error}
                    </p>
                )}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button
                        id="btn-start-intervention"
                        onClick={async () => {
                            setStarting(true);
                            try {
                                await api(`/action-plans/${saved.id}/status`, {
                                    method: "PATCH",
                                    body: JSON.stringify({ status: "IN_PROGRESS" }),
                                });
                                router.push(`/action-plans/${saved.id}`);
                            } catch (e) {
                                setError((e as Error).message);
                            } finally {
                                setStarting(false);
                            }
                        }}
                        disabled={starting}
                    >
                        {starting ? t.actionPlan.startingIntervention : t.actionPlan.btnStartIntervention}
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/dashboard")}>
                        {t.actionPlan.btnBackDashboard}
                    </Button>
                </div>
            </Card>
        );
    }

    const row = (label: string, value: string) => (
        <div className="min-w-0 space-y-0.5 py-3 first:pt-0 last:pb-0 sm:space-y-1 sm:py-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted sm:text-sm">{label}</p>
            <p className="text-base font-semibold leading-snug sm:text-lg">{value}</p>
        </div>
    );

    return (
        <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
            <h1 className="text-[1.75rem] font-bold leading-tight xs:text-3xl sm:text-4xl">
                {t.actionPlan.createTitle}
            </h1>
            <Card className="space-y-6 border-white/60 p-5 glass sm:p-8">
                {/* Context summary: a divided list on phones, three columns from sm. */}
                <div className="grid divide-y divide-line/60 rounded-2xl bg-surface-2/60 p-4 sm:grid-cols-3 sm:gap-6 sm:divide-y-0 sm:bg-transparent sm:p-0">
                    {row(t.actionPlan.student, studentLabel)}
                    {row(t.actionPlan.barrier, clar.barrier)}
                    {row(t.actionPlan.strategy, iv.title)}
                </div>
                <div className="space-y-2">
                    <label htmlFor="goal" className="font-semibold">
                        {t.actionPlan.goal}
                    </label>
                    <textarea
                        id="goal"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        rows={3}
                        maxLength={300}
                        placeholder={t.actionPlan.goalPlaceholder}
                        aria-describedby="goal-hint goal-count"
                        className="w-full rounded-2xl border border-line bg-surface/80 glass p-4 text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                    />
                    <div className="flex items-start justify-between gap-3 text-xs text-muted sm:text-sm">
                        <p id="goal-hint">{t.actionPlan.goalHint}</p>
                        <p id="goal-count" aria-live="polite" className="shrink-0 tabular-nums">
                            {goal.length}/300
                        </p>
                    </div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="timing" className="font-semibold">
                        {t.actionPlan.when}
                    </label>
                    <select
                        id="timing"
                        value={timing}
                        onChange={(e) => setTiming(e.target.value)}
                        className="h-12 w-full rounded-2xl border border-line bg-surface/80 glass px-4 text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                    >
                        {t.actionPlan.timings.map((tm) => (
                            <option key={tm}>{tm}</option>
                        ))}
                    </select>
                </div>
                {error && (
                    <p role="alert" className="rounded-xl bg-[#fbe9e7] px-4 py-3 text-sm text-danger">
                        {error}
                    </p>
                )}
                <Button
                    id="btn-save-plan"
                    size="lg"
                    onClick={save}
                    disabled={saving || !goal.trim()}
                    className="w-full"
                >
                    {saving ? t.actionPlan.saving : t.actionPlan.btnSave}
                </Button>
            </Card>
        </div>
    );
}
