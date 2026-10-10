"use client";

import { AlertTriangle, Sparkles, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PlanCard } from "@/components/plan-card";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/context";
import type { PlanRow } from "@/lib/knowledge";

interface Student {
    id: string;
    name: string;
    classId?: string;
    class?: { id: string; name: string };
}

export function StudentDetail({ id }: { id: string }) {
    const { t } = useLanguage();
    const [student, setStudent] = useState<Student | "general" | null>(null);
    const [plans, setPlans] = useState<PlanRow[] | null>(null);

    const isGeneral = id === "general";

    useEffect(() => {
        if (isGeneral) {
            setStudent("general");
        } else {
            api<Student>(`/students/${id}`)
                .then(setStudent)
                .catch(() => setStudent(null));
        }

        const q = new URLSearchParams(isGeneral ? {} : { student: id, global: "true" });
        api<PlanRow[]>(`/action-plans?${q.toString()}`)
            .then(setPlans)
            .catch(() => setPlans([]));
    }, [id, isGeneral]);

    if (!student) return <div className="h-64 animate-pulse rounded-card bg-surface-2" />;

    const studentName = isGeneral ? t.quickCheck.generalClassroom : (student as Student).name;
    const className = !isGeneral && (student as Student).class?.name;

    // Derived insights
    const completedPlans = plans?.filter((p) => p.status === "COMPLETED") || [];

    // Top barriers for this student
    const barrierCounts: Record<string, number> = {};
    for (const p of plans || []) {
        barrierCounts[p.barrierTitle] = (barrierCounts[p.barrierTitle] || 0) + 1;
    }
    const topBarriers = Object.entries(barrierCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // Effective vs Not Effective
    let helpful = 0;
    let notHelpful = 0;
    for (const p of completedPlans) {
        if (p.reflectionResult === "VERY_HELPFUL" || p.reflectionResult === "HELPFUL") helpful++;
        if (p.reflectionResult === "NOT_HELPFUL" || p.reflectionResult === "SOME_CHANGE") notHelpful++;
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <div className="space-y-6">
                <Link href="/students" className="text-sm font-medium text-muted hover:text-foreground">
                    {t.students.allStudents}
                </Link>

                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <span
                            className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${isGeneral ? "bg-accent-soft text-[#9a5612]" : "bg-surface-2 text-primary-strong"}`}
                        >
                            {isGeneral ? <Users size={32} /> : <UserRound size={32} />}
                        </span>
                        <div>
                            <h1 className="text-4xl font-bold">{studentName}</h1>
                            <p className="text-muted">
                                {isGeneral
                                    ? t.quickCheck.generalClassroomDesc
                                    : className
                                      ? `${className} • ${t.students.studentProfile}`
                                      : t.students.studentProfile}
                            </p>
                        </div>
                    </div>
                    <ButtonLink href={`/quick-check${!isGeneral ? `?student=${id}` : ""}`}>
                        {t.students.newQuickCheck}
                    </ButtonLink>
                </div>
            </div>

            {plans && plans.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">{t.dashboard.recentTitle}</h2>
                        <div className="grid gap-4">
                            {plans.map((p) => (
                                <PlanCard key={p.id} plan={p} />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="space-y-4 glass border-white/60">
                            <h3 className="text-lg font-bold">{t.students.barrierPatterns}</h3>
                            {topBarriers.length > 0 ? (
                                <ul className="space-y-3">
                                    {topBarriers.map(([title, count]) => (
                                        <li key={title} className="flex items-center justify-between gap-3 text-sm">
                                            <span className="font-medium text-muted">{title}</span>
                                            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-surface-2 px-2 font-bold text-primary-strong">
                                                {count}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted">{t.students.noData}</p>
                            )}
                        </Card>

                        {(helpful > 0 || notHelpful > 0) && (
                            <Card className="space-y-4 glass border-white/60">
                                <h3 className="text-lg font-bold">{t.students.successRate}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-success font-semibold">
                                            <Sparkles size={16} /> {t.students.helpful}
                                        </span>
                                        <span className="font-bold">{helpful}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-[#9a5612] font-semibold">
                                            <AlertTriangle size={16} /> {t.students.limited}
                                        </span>
                                        <span className="font-bold">{notHelpful}</span>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            ) : (
                <Card className="text-center space-y-4 p-10 glass border-white/60">
                    <h3 className="text-xl font-bold">{t.dashboard.noInterventions}</h3>
                    <p className="text-muted">{t.students.noInterventions}</p>
                    <div>
                        <ButtonLink href={`/quick-check${!isGeneral ? `?student=${id}` : ""}`}>
                            {t.dashboard.btnStart}
                        </ButtonLink>
                    </div>
                </Card>
            )}
        </div>
    );
}
