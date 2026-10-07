"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { PlanRow } from "@/lib/knowledge";
import { useKnowledge } from "@/lib/knowledge-context";
import { useLanguage } from "@/lib/i18n/context";

export function NewActionPlan() {
    const router = useRouter();
    const { t, locale } = useLanguage();
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
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState<PlanRow | null>(null);

    useEffect(() => {
        if (studentParam === "general") {
            setStudentLabel(t.dashboard.generalClassroom);
            return;
        }
        api<{ id: string; label: string }[]>("/students").then((l) => {
            const s = l.find((x) => x.id === studentParam);
            if (s) setStudentLabel(s.label);
        });
    }, [studentParam, t]);

    if (!clar || !iv) return <Card className="mx-auto max-w-xl text-center"><h1 className="text-2xl font-bold">Missing context. Start from Quick Check.</h1></Card>;

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
            <Card className="mx-auto max-w-xl space-y-6 p-10 text-center shadow-lift">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary"><CheckCircle2 size={34} aria-hidden="true" /></span>
                <h1 className="text-3xl font-bold">{t.actionPlan.createdTitle}</h1>
                <div className="space-y-1 text-muted">
                    <p className="font-semibold text-foreground">{studentLabel}</p>
                    <p>{iv.title}</p>
                    <p>Status: {locale === "id" ? "Direncanakan" : "Planned"}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button id="btn-start-intervention" onClick={async () => { await api(`/action-plans/${saved.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "IN_PROGRESS" }) }); router.push(`/action-plans/${saved.id}`); }}>{t.actionPlan.btnStartIntervention}</Button>
                    <Button variant="outline" onClick={() => router.push("/dashboard")}>{t.actionPlan.btnBackDashboard}</Button>
                </div>
            </Card>
        );
    }

    const row = (label: string, value: string) => (
        <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
        </div>
    );

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <h1 className="text-4xl font-bold">{t.actionPlan.createTitle}</h1>
            <Card className="space-y-6 p-8">
                <div className="grid gap-6 sm:grid-cols-3">
                    {row(t.actionPlan.student, studentLabel)}
                    {row(t.actionPlan.barrier, clar.barrier)}
                    {row(t.actionPlan.strategy, iv.title)}
                </div>
                <div className="space-y-2">
                    <label htmlFor="goal" className="font-semibold">{t.actionPlan.goal}</label>
                    <textarea
                        id="goal"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        rows={3}
                        maxLength={300}
                        placeholder={t.actionPlan.goalPlaceholder}
                        className="w-full rounded-2xl border border-line bg-surface p-4 text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="timing" className="font-semibold">{t.actionPlan.when}</label>
                    <select id="timing" value={timing} onChange={(e) => setTiming(e.target.value)} className="h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/15">
                        {t.actionPlan.timings.map((tm) => <option key={tm}>{tm}</option>)}
                    </select>
                </div>
                {error && <p role="alert" className="rounded-xl bg-[#fbe9e7] px-4 py-3 text-sm text-danger">{error}</p>}
                <Button id="btn-save-plan" size="lg" onClick={save} disabled={saving || !goal.trim()} className="w-full">
                    {saving ? t.actionPlan.saving : t.actionPlan.btnSave}
                </Button>
            </Card>
        </div>
    );
}
