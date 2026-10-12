"use client";

import { AlertTriangle, Check, CheckCircle2, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { StatusBadge } from "@/components/status-badge";
import { MobileActionBar } from "@/components/ui/action-bar";
import { BackLink } from "@/components/ui/back-link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
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

    const currentStepLabel = completed ? t.planDetail.reflectionSaved : (track[idx]?.label ?? track[0].label);
    const helpfulOutcome = plan.reflectionResult === "VERY_HELPFUL" || plan.reflectionResult === "HELPFUL";

    return (
        <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between gap-3">
                <BackLink href="/action-plans" label={t.planDetail.back} className="min-w-0" />
                {!cancelled && (
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={openEditModal}
                            aria-label={t.planDetail.btnEdit}
                            title={t.planDetail.btnEdit}
                            className="h-10 w-10 rounded-xl border-line p-0 text-xs font-semibold sm:h-9 sm:w-auto sm:px-3"
                        >
                            <Pencil size={14} aria-hidden="true" />
                            <span className="hidden sm:inline">{t.planDetail.btnEdit}</span>
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCancelModal(true)}
                            aria-label={t.planDetail.btnCancelPlan}
                            title={t.planDetail.btnCancelPlan}
                            className="h-10 w-10 rounded-xl p-0 text-xs font-semibold text-danger hover:bg-danger/10 hover:text-danger sm:h-9 sm:w-auto sm:px-3"
                        >
                            <Trash2 size={14} aria-hidden="true" />
                            <span className="hidden sm:inline">{t.planDetail.btnCancelPlan}</span>
                        </Button>
                    </div>
                )}
            </div>

            {cancelled && (
                <div className="flex flex-col gap-3 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-4 text-danger animate-in fade-in sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
                    <div className="flex items-start gap-3 sm:items-center">
                        <AlertTriangle size={20} className="mt-0.5 shrink-0 sm:mt-0" aria-hidden="true" />
                        <p className="text-sm font-semibold">{t.planDetail.cancelledNotice}</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRestorePlan}
                        disabled={isUpdating}
                        className="h-10 w-full shrink-0 rounded-xl border-danger/40 bg-surface text-xs font-semibold text-danger hover:bg-danger/10 sm:h-9 sm:w-auto"
                    >
                        <RotateCcw size={13} aria-hidden="true" />
                        {t.planDetail.btnRestorePlan}
                    </Button>
                </div>
            )}

            <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <p className="font-semibold text-primary">{plan.student?.name ?? t.dashboard.generalClassroom}</p>
                    <StatusBadge status={plan.status} />
                </div>
                <h1 className="text-[1.65rem] font-bold leading-tight xs:text-3xl sm:text-4xl">{plan.barrierTitle}</h1>
                <p className="text-base text-muted sm:text-xl">{iv?.title}</p>
            </div>

            <Card className="grid gap-5 border-white/60 p-5 glass sm:grid-cols-2 sm:gap-6 sm:p-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted sm:text-sm">
                        {t.planDetail.goal}
                    </p>
                    <p className="mt-1 text-base sm:text-lg">{plan.goal}</p>
                </div>
                <div className="border-t border-line/60 pt-4 sm:border-0 sm:pt-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted sm:text-sm">
                        {t.planDetail.when}
                    </p>
                    <p className="mt-1 text-base sm:text-lg">{plan.timing}</p>
                </div>
            </Card>

            {/* Tracker - only show when not cancelled */}
            {!cancelled && (
                <Card className="space-y-4 border-white/60 p-5 glass sm:space-y-6 sm:p-6">
                    <ol className="flex items-center" aria-label="Progress">
                        {track.map((tr, i) => {
                            const reached = completed || i <= idx;
                            return (
                                <li key={tr.id} className="flex flex-1 items-center last:flex-none">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold sm:h-9 sm:w-9 sm:text-sm ${reached ? "bg-primary text-white" : "bg-surface-2 text-muted"} ${!completed && i === idx ? "ring-4 ring-primary/15" : ""}`}
                                        >
                                            {reached && (completed || i < idx) ? (
                                                <Check size={15} aria-hidden="true" />
                                            ) : (
                                                i + 1
                                            )}
                                        </span>
                                        <span
                                            className={`hidden text-sm font-semibold sm:inline ${reached ? "text-foreground" : "text-muted"}`}
                                        >
                                            {tr.label}
                                        </span>
                                    </div>
                                    {i < track.length - 1 && (
                                        <span
                                            className={`mx-2 h-0.5 flex-1 rounded sm:mx-3 ${completed || i < idx ? "bg-primary" : "bg-line"}`}
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                    {/* Step labels are hidden beside the dots on phones — name the current one. */}
                    <p className="text-sm font-semibold sm:hidden">{currentStepLabel}</p>
                    {nextAction && (
                        <Button
                            id="btn-advance"
                            onClick={advance}
                            disabled={busy}
                            className="hidden w-full sm:w-auto md:inline-flex"
                        >
                            {nextAction.label}
                        </Button>
                    )}
                </Card>
            )}

            {iv && !completed && !cancelled && (
                <Card className="space-y-4 border-white/60 p-5 glass sm:p-6">
                    <h2 className="text-lg font-bold sm:text-xl">{t.planDetail.howToApply}</h2>
                    <ol className="space-y-2.5">
                        {iv.steps.map((s, i) => (
                            <li key={s} className="flex gap-3.5 text-[0.95rem] leading-relaxed sm:gap-4 sm:text-base">
                                <span className="shrink-0 font-display font-bold text-accent">0{i + 1}</span>
                                <span>{s}</span>
                            </li>
                        ))}
                    </ol>
                    <p className="rounded-2xl bg-sky-soft/70 px-4 py-3 text-sm">
                        <strong>{t.planDetail.whatToObserve}</strong> {iv.observe}
                    </p>
                </Card>
            )}

            {/* Phones: keep the next step within thumb reach after reading the steps. */}
            {!cancelled && nextAction && (
                <MobileActionBar className="md:hidden">
                    <Button id="btn-advance-mobile" onClick={advance} disabled={busy} size="lg" className="h-12 w-full">
                        {nextAction.label}
                    </Button>
                </MobileActionBar>
            )}

            {/* Reflection */}
            {!cancelled && plan.status === "NEEDS_REFLECTION" && (
                <Card className="space-y-6 border-white/60 p-5 shadow-lift glass sm:p-8">
                    <h2 className="text-2xl font-bold sm:text-3xl">{t.planDetail.reflectTitle}</h2>
                    <fieldset className="space-y-3">
                        <legend className="mb-3 font-semibold">{t.planDetail.didStrategyHelp}</legend>
                        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
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
                                    className={`relative flex min-h-16 cursor-pointer items-center rounded-2xl border-[1.5px] px-3.5 py-3 text-left text-sm font-semibold leading-snug transition-all glass active:scale-[0.98] sm:px-5 sm:py-4 sm:text-base ${result === r ? "border-primary bg-primary-soft/80 pr-9 sm:pr-11" : "border-white/60 bg-surface/80 hover:border-primary/50"}`}
                                >
                                    {resultLabels[r]}
                                    {result === r && (
                                        <span className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-white sm:right-4 sm:top-1/2 sm:h-6 sm:w-6 sm:-translate-y-1/2">
                                            <Check size={13} aria-hidden="true" />
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    {needsReason && (
                        <fieldset className="animate-in fade-in slide-in-from-top-2 space-y-3">
                            <legend className="mb-3 font-semibold">{t.planDetail.whatHappened}</legend>
                            <div className="grid gap-2">
                                {(Object.keys(reasonLabels) as ReflectionReason[]).map((r) => (
                                    <label
                                        key={r}
                                        className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-3 glass hover:bg-surface-2 ${reason === r ? "border-primary bg-primary-soft/50" : "border-white/60 bg-surface/80"}`}
                                    >
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={r}
                                            checked={reason === r}
                                            onChange={() => setReason(r)}
                                            className="h-5 w-5 shrink-0 accent-primary"
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
                            className="w-full rounded-2xl border border-line bg-surface/80 p-4 outline-none glass focus:border-primary focus:ring-4 focus:ring-primary/15"
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
                    <Card className="space-y-4 border-l-4 border-white/60 border-l-primary bg-primary-soft/30 p-5 shadow-none glass sm:p-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="shrink-0 text-primary" aria-hidden="true" />
                            <h2 className="text-xl font-bold sm:text-2xl">{t.planDetail.reflectionSaved}</h2>
                        </div>
                        <div className="space-y-1">
                            <p className="text-base sm:text-lg">
                                <strong>
                                    {plan.reflectionResult &&
                                        (resultLabels[plan.reflectionResult] ?? plan.reflectionResult)}
                                </strong>
                            </p>
                            {plan.reflectionReason && (
                                <p className="text-sm text-muted sm:text-base">
                                    {reasonLabels[plan.reflectionReason] ?? plan.reflectionReason}
                                </p>
                            )}
                        </div>
                        {plan.reflectionNote && (
                            <p className="text-base text-muted sm:text-lg">&ldquo;{plan.reflectionNote}&rdquo;</p>
                        )}

                        <div className="mt-4 rounded-xl bg-white p-4 text-sm font-medium text-muted shadow-sm">
                            {helpfulOutcome ? t.planDetail.insightHelpful : t.planDetail.insightNotHelpful}
                        </div>
                    </Card>
                    <div className="flex sm:justify-end">
                        <ButtonLink
                            href={helpfulOutcome ? "/action-plans" : "/quick-check"}
                            className="w-full justify-center sm:w-auto"
                        >
                            {helpfulOutcome ? t.planDetail.continueStrategy : t.planDetail.tryAnotherStrategy}
                        </ButtonLink>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <Modal open={isEditing} onClose={() => setIsEditing(false)} labelledBy="edit-plan-title">
                <form onSubmit={handleUpdatePlan} className="flex min-h-0 flex-1 flex-col">
                    <ModalHeader onClose={() => setIsEditing(false)} closeLabel={t.planDetail.cancelEdit}>
                        <h2 id="edit-plan-title" className="text-xl font-bold">
                            {t.planDetail.editModalTitle}
                        </h2>
                    </ModalHeader>
                    <ModalBody className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="edit-student" className="text-xs font-semibold text-muted">
                                {t.planDetail.editStudent}
                            </label>
                            <select
                                id="edit-student"
                                value={editStudentId}
                                onChange={(e) => setEditStudentId(e.target.value)}
                                className="h-12 w-full rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-primary sm:h-11"
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
                                className="h-12 w-full rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-primary sm:h-11"
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                            {t.planDetail.cancelEdit}
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                            {t.planDetail.saveChanges}
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>

            {/* Cancel (Soft Delete) Confirmation Modal */}
            <Modal
                open={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                labelledBy="cancel-plan-title"
                size="sm"
            >
                <ModalBody className="space-y-4 pt-4 sm:pt-6">
                    <div className="flex items-center gap-3 text-danger">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-danger/10">
                            <AlertTriangle size={20} aria-hidden="true" />
                        </span>
                        <h3 id="cancel-plan-title" className="text-lg font-bold">
                            {t.planDetail.confirmCancelTitle}
                        </h3>
                    </div>
                    <p className="text-sm text-muted">{t.planDetail.confirmCancelDesc}</p>
                </ModalBody>
                <ModalFooter className="grid grid-cols-2 gap-2 border-t-0 pt-0 sm:flex sm:justify-end">
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
                </ModalFooter>
            </Modal>
        </div>
    );
}
