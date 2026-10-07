"use client";

import { UserRound, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/context";

interface Student { id: string; label: string }

export function StudentList() {
    const { t, locale } = useLanguage();
    const [students, setStudents] = useState<Student[] | null>(null);

    useEffect(() => {
        api<Student[]>("/students").then(setStudents).catch(() => setStudents([]));
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <h1 className="text-4xl font-bold">{locale === "id" ? "Siswa" : "Students"}</h1>
                <ButtonLink href="/quick-check">{t.myInterventions.btnNew}</ButtonLink>
            </div>
            
            {students === null && <div className="h-28 animate-pulse rounded-card bg-surface-2" />}
            
            {students && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link href="/students/general" className="block group">
                        <Card interactive className="h-full space-y-4">
                            <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-[#9a5612] group-hover:scale-110 transition-transform">
                                <Users size={24} aria-hidden="true" />
                            </span>
                            <div>
                                <h3 className="text-xl font-bold">{t.quickCheck.generalClassroom}</h3>
                                <p className="text-muted">{t.quickCheck.generalClassroomDesc}</p>
                            </div>
                            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                                {locale === "id" ? "Lihat riwayat kelas" : "View classroom history"}
                                <ArrowRight size={14} aria-hidden="true" />
                            </p>
                        </Card>
                    </Link>

                    {students.map(s => (
                        <Link key={s.id} href={`/students/${s.id}`} className="block group">
                            <Card interactive className="h-full space-y-4">
                                <span className="grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-primary-strong group-hover:scale-110 transition-transform">
                                    <UserRound size={24} aria-hidden="true" />
                                </span>
                                <div>
                                    <h3 className="text-xl font-bold">{s.label}</h3>
                                    <p className="text-muted">{locale === "id" ? "Lihat riwayat siswa" : "View student history"}</p>
                                </div>
                                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                                    {locale === "id" ? "Lihat riwayat" : "View history"}
                                    <ArrowRight size={14} aria-hidden="true" />
                                </p>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
