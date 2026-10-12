"use client";

import { AlertTriangle, Check, CheckCircle2, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { StatusBadge } from "@/components/status-badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/context";
import {
    type PlanRow,
    type PlanStatus,
    REASON_LABELS_DATA,
    RESULT_LABELS_DATA,
    type ReflectionReason,
    type ReflectionResult,
} from "@/lib/knowledge";
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

    // Edit modal states
    const [isEditing, setIsEditing] = useState(false);
    const [editGoal, setEditGoal] = useState("");
    const [editTiming, setEditTiming] = useState("");
    const [editStudentId, setEditStudentId] = useState<string>("");
    const [students, setStudents] = useState<{ id: string; name: string }[]>([]);

    // Cancel modal state
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const load = useCallback(
        () =>
            api<PlanRow>(`/action-plans/${id}`)
                .then(setPlan)
                .catch((e) => setError(e.message)),
        [id],
    );

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        api<{ id: string; name: string }[]>("/students")
            .then(setStudents)
            .catch(() => {});
    }, []);

    if (error)
        return (
            <Card role="alert" className="text-danger">
                {error}
            </Card>
        );
    if (!plan) return <div className="h-64 animate-pulse rounded-card bg-surface-2" />;

    const iv = getIntervention(plan.interventionSlug);
    const completed = plan.status === "COMPLETED";
    const cancelled = plan.status === "CANCELLED";

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
        try {
            await api(`/action-plans/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: nextAction.to }),
            });
            await load();
        } finally {
            setBusy(false);
        }
    }

    async function reflect() {
        if (!result) return;
        setBusy(true);
        try {
            await api(`/action-plans/${id}/reflection`, {
                method: "POST",
                body: JSON.stringify({ result, reason: needsReason ? reason : undefined, note }),
            });
            await load();
        } finally {
            setBusy(false);
        }
    }

    function openEditModal() {
        if (!plan) return;
        setEditGoal(plan.goal);
        setEditTiming(plan.timing);
        setEditStudentId(plan.studentId ?? "");
        setIsEditing(true);
    }

    async function handleUpdatePlan(e: React.FormEvent) {
        e.preventDefault();
        if (!editGoal.trim()) return;
        setIsUpdating(true);
        try {
            await api(`/action-plans/${id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    goal: editGoal.trim(),
                    timing: editTiming.trim(),
                    studentId: editStudentId || null,
                }),
            });
            toast.success(
                locale === "id" ? "Rencana intervensi berhasil diperbarui" : "Intervention plan updated successfully",
            );
            setIsEditing(false);
            await load();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to update plan";
            toast.error(msg);
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleCancelPlan() {
        setIsUpdating(true);
        try {
            await api(`/action-plans/${id}`, {
                method: "DELETE",
            });
            toast.success(locale === "id" ? "Rencana intervensi dibatalkan" : "Intervention plan cancelled");
            setShowCancelModal(false);
            await load();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to cancel plan";
            toast.error(msg);
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleRestorePlan() {
        setIsUpdating(true);
        try {
            await api(`/action-plans/${id}/restore`, {
                method: "POST",
            });
            toast.success(
                locale === "id"
                    ? "Rencana intervensi berhasil diaktifkan kembali"
                    : "Intervention plan reactivated successfully",
            );
            await load();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to restore plan";
            toast.error(msg);
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <Link
                    href="/action-plans"
                    className="text-sm font-medium text-muted hover:text-foreground transition-colors"
                >
                    {t.planDetail.back}
                </Link>
                {!cancelled && (
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={openEditModal}
                            className="rounded-xl border-line px-3 py-1.5 text-xs font-semibold"
                        >
                            <Pencil size={13} className="mr-1.5" />
                            {t.planDetail.btnEdit}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCancelModal(true)}
                            className="rounded-xl px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/10 hover:text-danger"
                        >
                            <Trash2 size={13} className="mr-1.5" />
                            {t.planDetail.btnCancelPlan}
                        </Button>
                    </div>
                )}
            </div>

            {cancelled && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-danger/30 bg-danger/10 px-5 py-4 text-danger animate-in fade-in">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={20} className="shrink-0" />
                        <p className="text-sm font-semibold">{t.planDetail.cancelledNotice}</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRestorePlan}
                        disabled={isUpdating}
                        className="rounded-xl border-danger/40 bg-surface text-danger hover:bg-danger/10 text-xs font-semibold"
                    >
                        <RotateCcw size={13} className="mr-1.5" />
                        {t.planDetail.btnRestorePlan}
                    </Button>
                </div>
            )}

            <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-primary">{plan.student?.name ?? t.dashboard.generalClassroom}</p>
                    <StatusBadge status={plan.status} />
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold">{plan.barrierTitle}</h1>
                <p className="text-lg sm:text-xl text-muted">{iv?.title}</p>
            </div>

            <Card className="grid gap-6 sm:grid-cols-2 glass border-white/60 p-5 sm:p-6">
                <div>
                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted">{t.planDetail.goal}</p>
                    <p className="mt-1 text-base sm:text-lg">{plan.goal}</p>
                </div>
                <div>
                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted">{t.planDetail.when}</p>
                    <p className="mt-1 text-base sm:text-lg">{plan.timing}</p>
                </div>
            </Card>

            {/* Tracker - only show when not cancelled */}
            {!cancelled && (
                <Card className="space-y-6 glass border-white/60 p-5 sm:p-6">
                    <ol className="flex items-center" aria-label="Progress">
                        {track.map((tr, i) => {
                            const reached = completed || i <= idx;
                            return (
                                <li key={tr.id} className="flex flex-1 items-center last:flex-none">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-full text-xs sm:text-sm font-bold ${reached ? "bg-primary text-white" : "bg-surface-2 text-muted"}`}
                                        >
                                            {reached && (completed || i < idx) ? (
                                                <Check size={15} aria-hidden="true" />
                                            ) : (
                                                i + 1
                                            )}
                                        </span>
                                        <span
                                            className={`hidden sm:inline text-sm font-semibold ${reached ? "text-foreground" : "text-muted"}`}
                                        >
                                            {tr.label}
                                        </span>
                                    </div>
                                    {i < track.length - 1 && (
                                        <span
                                            className={`mx-2 sm:mx-3 h-0.5 flex-1 rounded ${completed || i < idx ? "bg-primary" : "bg-line"}`}
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                    {nextAction && (
                        <Button id="btn-advance" onClick={advance} disabled={busy} className="w-full sm:w-auto">
                            {nextAction.label}
                        </Button>
                    )}
                </Card>
            )}

            {iv && !completed && !cancelled && (
                <Card className="space-y-4 glass border-white/60 p-5 sm:p-6">
                    <h2 className="text-xl font-bold">{t.planDetail.howToApply}</h2>
                    <ol className="space-y-2">
                        {iv.steps.map((s, i) => (
                            <li key={s} className="flex gap-4 text-sm sm:text-base">
                                <span className="font-display font-bold text-accent shrink-0">0{i + 1}</span>
                                <span>{s}</span>
                            </li>
                        ))}
                    </ol>
                    <p className="rounded-2xl bg-sky-soft/70 px-4 py-3 text-xs sm:text-sm">
                        <strong>{t.planDetail.whatToObserve}</strong> {iv.observe}
                    </p>
                </Card>
            )}

            {/* Reflection */}
            {!cancelled && plan.status === "NEEDS_REFLECTION" && (
                <Card className="space-y-6 p-5 sm:p-8 shadow-lift glass border-white/60">
                    <h2 className="text-2xl sm:text-3xl font-bold">{t.planDetail.reflectTitle}</h2>
                    <fieldset className="space-y-3">
                        <legend className="font-semibold">{t.planDetail.didStrategyHelp}</legend>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {(Object.keys(resultLabels) as ReflectionResult[]).map((r) => (
                                <button
                                    key={r}
                                    id={`result-${r.toLowerCase()}`}
                                    type="button"
                                    aria-pressed={result === r}
                                    onClick={() => {
                                        setResult(r);
                                        setReason(null);
                                    }}
                                    className={`cursor-pointer rounded-2xl border-[1.5px] px-5 py-4 text-left font-semibold transition-all glass ${result === r ? "border-primary bg-primary-soft/80" : "border-white/60 bg-surface/80 hover:border-primary/50"}`}
                                >
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
                                    <label
                                        key={r}
                                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/60 p-3 bg-surface/80 glass hover:bg-surface-2"
                                    >
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={r}
                                            checked={reason === r}
                                            onChange={() => setReason(r)}
                                            className="h-4 w-4 accent-primary"
                                        />
                                        <span className="text-sm font-medium">{reasonLabels[r]}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="note" className="font-semibold">
                            {t.planDetail.whatDidYouObserve}
                        </label>
                        <textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={4}
                            maxLength={1000}
                            placeholder={t.planDetail.observePlaceholder}
                            className="w-full rounded-2xl border border-line bg-surface/80 glass p-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                        />
                    </div>
                    <Button
                        id="btn-save-reflection"
                        size="lg"
                        onClick={reflect}
                        disabled={!canReflect}
                        className="w-full"
                    >
                        {t.planDetail.btnSaveReflection}
                    </Button>
                </Card>
            )}

            {completed && (
                <div className="space-y-4">
                    <Card className="space-y-4 border-l-4 border-l-primary bg-primary-soft/30 shadow-none glass border-white/60">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-primary" aria-hidden="true" />
                            <h2 className="text-2xl font-bold">{t.planDetail.reflectionSaved}</h2>
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg">
                                <strong>
                                    {plan.reflectionResult &&
                                        (resultLabels[plan.reflectionResult] ?? plan.reflectionResult)}
                                </strong>
                            </p>
                            {plan.reflectionReason && (
                                <p className="text-muted">
                                    {reasonLabels[plan.reflectionReason] ?? plan.reflectionReason}
                                </p>
                            )}
                        </div>
                        {plan.reflectionNote && (
                            <p className="text-lg text-muted">&ldquo;{plan.reflectionNote}&rdquo;</p>
                        )}

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

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
                    <Card className="w-full max-w-lg space-y-5 border-white/80 p-6 shadow-2xl glass">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">{t.planDetail.editModalTitle}</h2>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdatePlan} className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="edit-student" className="text-xs font-semibold text-muted">
                                    {t.planDetail.editStudent}
                                </label>
                                <select
                                    id="edit-student"
                                    value={editStudentId}
                                    onChange={(e) => setEditStudentId(e.target.value)}
                                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                                >
                                    <option value="">{t.dashboard.generalClassroom}</option>
                                    {students.map((st) => (
                                        <option key={st.id} value={st.id}>
                                            {st.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="edit-goal" className="text-xs font-semibold text-muted">
                                    {t.planDetail.editGoal}
                                </label>
                                <textarea
                                    id="edit-goal"
                                    required
                                    maxLength={300}
                                    rows={3}
                                    value={editGoal}
                                    onChange={(e) => setEditGoal(e.target.value)}
                                    className="w-full rounded-xl border border-line bg-surface p-3 text-sm outline-none focus:border-primary"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="edit-timing" className="text-xs font-semibold text-muted">
                                    {t.planDetail.editTiming}
                                </label>
                                <input
                                    id="edit-timing"
                                    required
                                    maxLength={120}
                                    value={editTiming}
                                    onChange={(e) => setEditTiming(e.target.value)}
                                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                                    {t.planDetail.cancelEdit}
                                </Button>
                                <Button type="submit" disabled={isUpdating}>
                                    {t.planDetail.saveChanges}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Cancel (Soft Delete) Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
                    <Card className="w-full max-w-md space-y-4 border-white/80 p-6 shadow-2xl glass">
                        <div className="flex items-center gap-3 text-danger">
                            <span className="grid h-10 w-10 place-items-center rounded-full bg-danger/10 shrink-0">
                                <AlertTriangle size={20} />
                            </span>
                            <h3 className="text-lg font-bold">{t.planDetail.confirmCancelTitle}</h3>
                        </div>
                        <p className="text-sm text-muted">{t.planDetail.confirmCancelDesc}</p>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setShowCancelModal(false)}>
                                {t.planDetail.cancelEdit}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCancelPlan}
                                disabled={isUpdating}
                                className="bg-danger text-white hover:bg-danger/90"
                            >
                                {t.planDetail.confirmCancelBtn}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
