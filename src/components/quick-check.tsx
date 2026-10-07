"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Plus, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { flowQs } from "@/lib/flow";
import { useKnowledge } from "@/lib/knowledge-context";
import { useLanguage } from "@/lib/i18n/context";

interface Student { id: string; label: string }

function choiceCls(selected: boolean) {
    return `flex w-full cursor-pointer items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
        selected ? "border-primary bg-primary-soft shadow-soft" : "border-line bg-surface hover:border-primary/50 hover:-translate-y-0.5"
    }`;
}

export function QuickCheck() {
    const { t, locale } = useLanguage();
    const [step, setStep] = useState(0); // 0..2 questions, 3 = result
    const [students, setStudents] = useState<Student[]>([]);
    const [student, setStudent] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
    const [clarId, setClarId] = useState<string | null>(null);

    const { categories } = useKnowledge();
    const cat = categories.find((c) => c.id === selectedCatId);
    const clar = cat?.clarifications.find((c) => c.id === clarId);

    const stepsLabels = [
        locale === "id" ? "Siswa" : "Student",
        locale === "id" ? "Pengamatan" : "Observation",
        locale === "id" ? "Klarifikasi" : "Clarify",
    ];

    useEffect(() => {
        api<Student[]>("/students").then(setStudents).catch(() => setStudents([]));
    }, []);

    async function addStudent() {
        const label = newLabel.trim() || `Student ${String.fromCharCode(65 + students.length)}`;
        const s = await api<Student>("/students", { method: "POST", body: JSON.stringify({ label }) });
        setStudents((p) => (p.some((x) => x.id === s.id) ? p : [...p, s]));
        setStudent(s.id);
        setAdding(false);
        setNewLabel("");
    }

    const canNext = step === 0 ? !!student : step === 1 ? !!selectedCatId : step === 2 ? !!clarId : false;

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            {/* Progress */}
            {step < 3 && (
                <div className="space-y-3" aria-label={`Step ${step + 1} of 3`}>
                    <ol className="flex items-center gap-3">
                        {stepsLabels.map((label, i) => (
                            <li key={label} className="flex flex-1 items-center gap-3">
                                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold transition-colors ${i <= step ? "bg-primary text-white" : "bg-surface-2 text-muted"}`}>
                                    {i < step ? <Check size={16} aria-hidden="true" /> : i + 1}
                                </span>
                                <span className={`hidden text-sm font-medium sm:inline ${i === step ? "text-foreground" : "text-muted"}`}>{label}</span>
                                {i < stepsLabels.length - 1 && <span className={`h-0.5 flex-1 rounded ${i < step ? "bg-primary" : "bg-line"}`} />}
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.div
                    key={`${step}-${locale}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    {step === 0 && (
                        <>
                            <h1 className="text-4xl font-bold">{t.quickCheck.step1Title}</h1>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {students.map((s) => (
                                    <button key={s.id} id={`student-${s.id}`} type="button" onClick={() => setStudent(s.id)} className={choiceCls(student === s.id)}>
                                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-primary-strong"><UserRound size={20} aria-hidden="true" /></span>
                                        <span className="text-lg font-semibold">{s.label}</span>
                                    </button>
                                ))}
                                <button id="student-general" type="button" onClick={() => setStudent("general")} className={choiceCls(student === "general")}>
                                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-[#9a5612]"><Users size={20} aria-hidden="true" /></span>
                                    <span>
                                        <span className="block text-lg font-semibold">{t.quickCheck.generalClassroom}</span>
                                        <span className="block text-sm text-muted">{t.quickCheck.generalClassroomDesc}</span>
                                    </span>
                                </button>
                            </div>
                            {adding ? (
                                <Card className="flex flex-col gap-3 sm:flex-row">
                                    <input
                                        id="input-new-student"
                                        autoFocus
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                        placeholder={`e.g. Student ${String.fromCharCode(65 + students.length)}`}
                                        maxLength={40}
                                        aria-label="Student identifier"
                                        className="h-12 flex-1 rounded-2xl border border-line px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                                    />
                                    <Button id="btn-save-student" onClick={addStudent}>{t.quickCheck.btnAdd}</Button>
                                </Card>
                            ) : (
                                <button id="btn-add-student" type="button" onClick={() => setAdding(true)} className="inline-flex cursor-pointer items-center gap-2 font-semibold text-primary hover:underline">
                                    <Plus size={16} aria-hidden="true" /> {t.quickCheck.addStudent}
                                </button>
                            )}
                            <p className="text-sm text-muted">{t.quickCheck.privacyHint}</p>
                        </>
                    )}

                    {step === 1 && (
                        <>
                            <h1 className="text-4xl font-bold">{t.quickCheck.step2Title}</h1>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {categories.map((c) => (
                                    <button
                                        key={c.id}
                                        id={`barrier-${c.id.toLowerCase()}`}
                                        type="button"
                                        onClick={() => { setSelectedCatId(c.id); setClarId(null); }}
                                        className={choiceCls(selectedCatId === c.id)}
                                    >
                                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-strong"><CategoryIcon icon={c.icon} /></span>
                                        <span>
                                            <span className="block text-lg font-semibold">{c.title}</span>
                                            <span className="block text-sm text-muted">{c.description}</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {step === 2 && cat && (
                        <>
                            <h1 className="text-4xl font-bold">{t.quickCheck.step3Title}</h1>
                            <div className="space-y-3" role="radiogroup" aria-label="Clarification">
                                {cat.clarifications.map((c) => (
                                    <button key={c.id} id={`clar-${c.id}`} type="button" role="radio" aria-checked={clarId === c.id} onClick={() => setClarId(c.id)} className={choiceCls(clarId === c.id)}>
                                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${clarId === c.id ? "border-primary bg-primary" : "border-line"}`}>
                                            {clarId === c.id && <span className="h-2 w-2 rounded-full bg-white" />}
                                        </span>
                                        <span className="text-lg font-medium">{c.label}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {step === 3 && cat && clar && student && (
                        <>
                            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{t.quickCheck.resultBadge}</p>
                            <h1 className="text-5xl font-bold">{clar.barrier}</h1>
                            <Card className="space-y-5 p-8">
                                <p className="text-xl leading-relaxed">{clar.insight}</p>
                                <div className="border-t border-line pt-5">
                                    <p className="text-sm font-semibold uppercase tracking-wider text-muted">{t.quickCheck.whatThisMeans}</p>
                                    <p className="mt-2 text-lg text-muted">{cat.meaning}</p>
                                </div>
                            </Card>
                            <p className="rounded-2xl bg-accent-soft px-5 py-4 text-sm text-[#7a4510]">
                                {t.quickCheck.notADiagnosis}
                            </p>
                            <ButtonLink
                                id="btn-see-supports"
                                href={`/quick-check/supports?${flowQs({ student, cat: cat.id, clar: clar.id })}`}
                                size="lg"
                            >
                                {t.quickCheck.seeSupports} <ArrowRight size={18} aria-hidden="true" />
                            </ButtonLink>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between pt-2">
                {step > 0 ? (
                    <Button id="btn-back" variant="ghost" onClick={() => setStep(step - 1)}>
                        <ArrowLeft size={16} aria-hidden="true" /> {t.quickCheck.back}
                    </Button>
                ) : (
                    <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-foreground">{t.quickCheck.cancel}</Link>
                )}
                {step < 3 && (
                    <Button id="btn-next" size="lg" disabled={!canNext} onClick={() => setStep(step + 1)}>
                        {step === 2 ? t.quickCheck.showInsight : t.quickCheck.continue} <ArrowRight size={18} aria-hidden="true" />
                    </Button>
                )}
            </div>
        </div>
    );
}
