"use client";

import { ArrowRight, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/context";

interface Student {
    id: string;
    name: string;
}
interface ClassData {
    id: string;
    name: string;
    students: Student[];
}

export function StudentList() {
    const { t, locale } = useLanguage();
    const [classesData, setClassesData] = useState<ClassData[] | null>(null);

    useEffect(() => {
        api<ClassData[]>("/students/classes")
            .then(setClassesData)
            .catch(() => setClassesData([]));
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <h1 className="text-4xl font-bold">{t.students.title}</h1>
                <div className="flex gap-3">
                    <ButtonLink href="/students/manage" variant="soft">{t.students.manageClasses}</ButtonLink>
                    <ButtonLink href="/quick-check">{t.myInterventions.btnNew}</ButtonLink>
                </div>
            </div>

            {classesData === null && <div className="h-28 animate-pulse rounded-card bg-surface-2" />}

            {classesData && (
                <div className="space-y-8">
                    <Link href="/students/general" className="block group w-full md:w-1/2 lg:w-1/3">
                        <Card interactive className="h-full space-y-4 glass border-white/60">
                            <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-[#9a5612] group-hover:scale-110 transition-transform">
                                <Users size={24} aria-hidden="true" />
                            </span>
                            <div>
                                <h3 className="text-xl font-bold">{t.quickCheck.generalClassroom}</h3>
                                <p className="text-muted">{t.quickCheck.generalClassroomDesc}</p>
                            </div>
                            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                                {t.students.viewGeneralHistory}
                                <ArrowRight size={14} aria-hidden="true" />
                            </p>
                        </Card>
                    </Link>

                    {classesData.map((c) => (
                        <div key={c.id} className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Users size={24} className="text-primary" /> {c.name}
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {c.students.map((s) => (
                                    <Link key={s.id} href={`/students/${s.id}`} className="block group">
                                        <Card interactive className="h-full space-y-4 glass border-white/60">
                                            <span className="grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-primary-strong group-hover:scale-110 transition-transform">
                                                <UserRound size={24} aria-hidden="true" />
                                            </span>
                                            <div>
                                                <h3 className="text-xl font-bold">{s.name}</h3>
                                                <p className="text-muted">{t.students.student}</p>
                                            </div>
                                            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                                                {t.students.viewProfile}
                                                <ArrowRight size={14} aria-hidden="true" />
                                            </p>
                                        </Card>
                                    </Link>
                                ))}
                                {c.students.length === 0 && (
                                    <p className="text-muted col-span-full">
                                        {t.students.noStudentsInClass}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
