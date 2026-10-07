"use client";

import { Check, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { type PlanRow, type PlanStatus, RESULT_LABELS_DATA, type ReflectionResult, REASON_LABELS_DATA, type ReflectionReason } from "@/lib/knowledge";
import { useLanguage } from "@/lib/i18n/context";
import { useKnowledge } from "@/lib/knowledge-context";

export function PlanDetail({ id }: { id: string }) {
    const { t, locale } = useLanguage();
    const { getIntervention } = useKnowledge();
    const [plan, setPlan] = useState<PlanRow | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ReflectionResult | null>(null);
    const [reason, setReason] = useState<ReflectionReason | null>(null);
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);

    const load = useCallback(() => api<PlanRow>(`/action-plans/${id}`).then(setPlan).catch((e) => setError(e.message)), [id]);
    useEffect(() => { load(); }, [load]);

    if (error) return <Card role="alert" className="text-danger">{error}</Card>;
    if (!plan) return <div className="h-64 animate-pulse rounded-card bg-surface-2" />;

    const iv = getIntervention(plan.interventionSlug);
    const completed = plan.status === "COMPLETED";

    const track: { id: PlanStatus; label: string }[] = [
        { id: "PLANNED", label: t.planDetail.progress.planned },
        { id: "IN_PROGRESS", label: t.planDetail.progress.inProgress },
        { id: "NEEDS_REFLECTION", label: t.planDetail.progress.reflection },
    ];

    const next: Partial<Record<PlanStatus, { to: "IN_PROGRESS" | "NEEDS_REFLECTION"; label: string }>> = {
        PLANNED: { to: "IN_PROGRESS", label: t.planDetail.btnStart },
        IN_PROGRESS: { to: "NEEDS_REFLECTION", label: t.planDetail.btnReflect },
    };

    const idx = track.findIndex((tr) => tr.id === plan.status);
    const nextAction = next[plan.status];
    const resultLabels = RESULT_LABELS_DATA[locale];
    const reasonLabels = REASON_LABELS_DATA[locale];

    const needsReason = result === "SOME_CHANGE" || result === "NOT_HELPFUL";
    const canReflect = result && (!needsReason || reason) && !busy;

    async function advance() {
        if (!nextAction) return;
        setBusy(true);
        await api(`/action-plans/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: nextAction.to }) });
        await load();
        setBusy(false);
    }

    async function reflect() {
        if (!result) return;
        setBusy(true);
        await api(`/action-plans/${id}/reflection`, { method: "POST", body: JSON.stringify({ result, reason: needsReason ? reason : undefined, note }) });
        await load();
        setBusy(false);
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <Link href="/action-plans" className="text-sm font-medium text-muted hover:text-foreground">
                {t.planDetail.back}
            </Link>

            <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-primary">{plan.student?.name ?? t.dashboard.generalClassroom}</p>
                    <StatusBadge status={plan.status} />
                </div>
                <h1 className="text-4xl font-bold">{plan.barrierTitle}</h1>
                <p className="text-xl text-muted">{iv?.title}</p>
            </div>

            <Card className="grid gap-6 sm:grid-cols-2">
                <div><p className="text-sm font-semibold uppercase tracking-wider text-muted">{t.planDetail.goal}</p><p className="mt-1 text-lg">{plan.goal}</p></div>
                <div><p className="text-sm font-semibold uppercase tracking-wider text-muted">{t.planDetail.when}</p><p className="mt-1 text-lg">{plan.timing}</p></div>
            </Card>

            {/* Tracker */}
            <Card className="space-y-6">
                <ol className="flex items-center" aria-label="Progress">
                    {track.map((tr, i) => {
                        const reached = completed || i <= idx;
                        return (
                            <li key={tr.id} className="flex flex-1 items-center last:flex-none">
                                <div className="flex items-center gap-2">
                                    <span className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${reached ? "bg-primary text-white" : "bg-surface-2 text-muted"}`}>
                                        {reached && (completed || i < idx) ? <Check size={16} aria-hidden="true" /> : i + 1}
                                    </span>
                                    <span className={`text-sm font-semibold ${reached ? "text-foreground" : "text-muted"}`}>{tr.label}</span>
                                </div>
                                {i < track.length - 1 && <span className={`mx-3 h-0.5 flex-1 rounded ${completed || i < idx ? "bg-primary" : "bg-line"}`} />}
                            </li>
                        );
                    })}
                </ol>
                {nextAction && <Button id="btn-advance" onClick={advance} disabled={busy}>{nextAction.label}</Button>}
            </Card>

            {iv && !completed && (
                <Card className="space-y-4">
                    <h2 className="text-xl font-bold">{t.planDetail.howToApply}</h2>
                    <ol className="space-y-2">
                        {iv.steps.map((s, i) => (
                            <li key={s} className="flex gap-4"><span className="font-display font-bold text-accent">0{i + 1}</span>{s}</li>
                        ))}
                    </ol>
                    <p className="rounded-2xl bg-sky-soft/70 px-4 py-3 text-sm"><strong>{t.planDetail.whatToObserve}</strong> {iv.observe}</p>
                </Card>
            )}

            {/* Reflection */}
            {plan.status === "NEEDS_REFLECTION" && (
                <Card className="space-y-6 p-8 shadow-lift">
                    <h2 className="text-3xl font-bold">{t.planDetail.reflectTitle}</h2>
                    <fieldset className="space-y-3">
                        <legend className="font-semibold">{t.planDetail.didStrategyHelp}</legend>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {(Object.keys(resultLabels) as ReflectionResult[]).map((r) => (
                                <button key={r} id={`result-${r.toLowerCase()}`} type="button" aria-pressed={result === r} onClick={() => { setResult(r); setReason(null); }} className={`cursor-pointer rounded-2xl border-2 px-5 py-4 text-left font-semibold transition-all ${result === r ? "border-primary bg-primary-soft" : "border-line hover:border-primary/50"}`}>
                                    {resultLabels[r]}
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    {needsReason && (
                        <fieldset className="animate-in fade-in slide-in-from-top-2 space-y-3">
                            <legend className="font-semibold">{t.planDetail.whatHappened}</legend>
                            <div className="grid gap-2">
                                {(Object.keys(reasonLabels) as ReflectionReason[]).map((r) => (
                                    <label key={r} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-3 hover:bg-surface-2">
                                        <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="h-4 w-4 accent-primary" />
                                        <span className="text-sm font-medium">{reasonLabels[r]}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="note" className="font-semibold">{t.planDetail.whatDidYouObserve}</label>
                        <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={4} maxLength={1000} placeholder={t.planDetail.observePlaceholder} className="w-full rounded-2xl border border-line p-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
                    </div>
                    <Button id="btn-save-reflection" size="lg" onClick={reflect} disabled={!canReflect} className="w-full">{t.planDetail.btnSaveReflection}</Button>
                </Card>
            )}

            {completed && (
                <div className="space-y-4">
                    <Card className="space-y-4 border-l-4 border-l-primary bg-primary-soft/30 shadow-none">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-primary" aria-hidden="true" />
                            <h2 className="text-2xl font-bold">{t.planDetail.reflectionSaved}</h2>
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg"><strong>{plan.reflectionResult && (resultLabels[plan.reflectionResult] ?? plan.reflectionResult)}</strong></p>
                            {plan.reflectionReason && <p className="text-muted">{reasonLabels[plan.reflectionReason] ?? plan.reflectionReason}</p>}
                        </div>
                        {plan.reflectionNote && <p className="text-lg text-muted">&ldquo;{plan.reflectionNote}&rdquo;</p>}
                        
                        <div className="mt-4 rounded-xl bg-white p-4 text-sm font-medium text-muted-foreground shadow-sm">
                            {plan.reflectionResult === "VERY_HELPFUL" || plan.reflectionResult === "HELPFUL" 
                                ? t.planDetail.insightHelpful 
                                : t.planDetail.insightNotHelpful}
                        </div>
                    </Card>
                    <div className="flex justify-end gap-3">
                        {plan.reflectionResult === "VERY_HELPFUL" || plan.reflectionResult === "HELPFUL" ? (
                            <ButtonLink href="/action-plans">{t.planDetail.continueStrategy}</ButtonLink>
                        ) : (
                            <ButtonLink href="/quick-check">{t.planDetail.tryAnotherStrategy}</ButtonLink>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
