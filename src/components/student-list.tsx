"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    ChevronRight,
    GraduationCap,
    Plus,
    Search,
    Settings,
    UserRound,
    Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [studentSearch, setStudentSearch] = useState("");

    useEffect(() => {
        api<ClassData[]>("/students/classes")
            .then(setClassesData)
            .catch(() => setClassesData([]));
    }, []);

    // Filter classes in class-overview mode
    const filteredClasses = useMemo(() => {
        if (!classesData) return null;
        if (!search.trim()) return classesData;
        const q = search.toLowerCase();
        return classesData.filter(
            (c) => c.name.toLowerCase().includes(q) || c.students.some((st) => st.name.toLowerCase().includes(q)),
        );
    }, [classesData, search]);

    // Current selected class in drill-down mode
    const currentClass = selectedClassId ? classesData?.find((c) => c.id === selectedClassId) : null;

    // Filter students inside selected class
    const filteredStudents = useMemo(() => {
        if (!currentClass) return [];
        if (!studentSearch.trim()) return currentClass.students;
        const q = studentSearch.toLowerCase();
        return currentClass.students.filter((st) => st.name.toLowerCase().includes(q));
    }, [currentClass, studentSearch]);

    // Total students count across all classes
    const totalStudents = classesData?.reduce((acc, c) => acc + c.students.length, 0) ?? 0;

    return (
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                {!selectedClassId || !currentClass ? (
                    /* LEVEL 1: CLASS LIST OVERVIEW */
                    <motion.div
                        key="class-list-view"
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -14 }}
                        transition={{ duration: 0.22 }}
                        className="space-y-6"
                    >
                        {/* Header */}
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div className="min-w-0 space-y-1">
                                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">{t.students.title}</h1>
                                <p className="text-sm sm:text-base text-muted">
                                    {locale === "id"
                                        ? `Pilih kelas untuk melihat ${totalStudents} siswa atau kelola struktur kelas.`
                                        : `Select a class to view ${totalStudents} students or manage classes.`}
                                </p>
                            </div>
                            <div className="grid w-full grid-cols-2 gap-2.5 sm:flex sm:w-auto sm:gap-3">
                                <ButtonLink href="/students/manage" variant="soft" className="min-w-0 px-4">
                                    <Settings size={16} aria-hidden="true" className="shrink-0" />
                                    <span className="truncate">{t.students.manageClasses}</span>
                                </ButtonLink>
                                <ButtonLink href="/quick-check" className="min-w-0 px-4">
                                    <Plus size={16} aria-hidden="true" className="shrink-0" />
                                    <span className="truncate">{t.myInterventions.btnNew}</span>
                                </ButtonLink>
                            </div>
                        </div>

                        {/* Search Bar & General Classroom Shortcut */}
                        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                            <Card className="glass border-white/60 p-3.5 flex items-center gap-3">
                                <Search className="text-muted shrink-0" size={18} aria-hidden="true" />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={
                                        locale === "id"
                                            ? "Cari nama kelas atau siswa..."
                                            : "Search classes or students..."
                                    }
                                    className="w-full border-0 bg-transparent p-0 focus:outline-none text-sm placeholder:text-muted"
                                />
                            </Card>

                            <Link href="/students/general" className="block group">
                                <Card
                                    interactive
                                    className="h-full px-4 py-3 glass border-accent/40 bg-accent-soft/20 flex items-center gap-3"
                                >
                                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-[#9a5612] group-hover:scale-105 transition-transform shrink-0">
                                        <Users size={20} aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0 pr-2">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-[#9a5612]">
                                            {t.quickCheck.generalClassroom}
                                        </p>
                                        <p className="text-xs text-muted truncate">{t.students.viewGeneralHistory}</p>
                                    </div>
                                    <ArrowRight
                                        size={15}
                                        className="text-[#9a5612] shrink-0 group-hover:translate-x-1 transition-transform"
                                    />
                                </Card>
                            </Link>
                        </div>

                        {/* Class Grid */}
                        {!filteredClasses ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3, 4, 5, 6].map((idx) => (
                                    <div key={idx} className="h-40 animate-pulse rounded-2xl bg-surface-2" />
                                ))}
                            </div>
                        ) : filteredClasses.length === 0 ? (
                            <Card className="glass border-white/60 p-12 text-center text-muted space-y-2">
                                <GraduationCap size={36} className="mx-auto text-muted/60" aria-hidden="true" />
                                <p className="font-medium">
                                    {locale === "id" ? "Tidak ada kelas yang ditemukan." : "No classes found."}
                                </p>
                            </Card>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                                {filteredClasses.map((c) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedClassId(c.id);
                                            setStudentSearch("");
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                        className="group block h-full w-full cursor-pointer rounded-[var(--radius-card)] text-left"
                                    >
                                        <Card
                                            interactive
                                            className="flex h-full flex-col justify-between space-y-4 border-white/60 p-4 glass transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-soft sm:p-5"
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-strong group-hover:bg-primary group-hover:text-white transition-colors shadow-xs">
                                                            <GraduationCap size={24} aria-hidden="true" />
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <h2 className="font-bold text-lg sm:text-xl text-foreground truncate group-hover:text-primary transition-colors">
                                                                {c.name}
                                                            </h2>
                                                            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 mt-1 rounded-full bg-surface-2 text-muted">
                                                                {c.students.length} {t.students.student}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Preview first students */}
                                                <div className="pt-2.5 border-t border-line/50 min-h-12 flex flex-col justify-center">
                                                    {c.students.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5 items-center">
                                                            {c.students.slice(0, 3).map((st) => (
                                                                <span
                                                                    key={st.id}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-surface-2 text-foreground/80 max-w-28 truncate"
                                                                >
                                                                    <UserRound
                                                                        size={11}
                                                                        className="text-muted shrink-0"
                                                                        aria-hidden="true"
                                                                    />
                                                                    <span className="truncate">{st.name}</span>
                                                                </span>
                                                            ))}
                                                            {c.students.length > 3 && (
                                                                <span className="text-xs font-semibold text-muted pl-0.5">
                                                                    +{c.students.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-muted italic">
                                                            {t.students.noStudentsInClass}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action footer */}
                                            <div className="flex items-center justify-between pt-2 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                                                <span>
                                                    {locale === "id"
                                                        ? `Buka Kelas (${c.students.length} Siswa)`
                                                        : `Open Class (${c.students.length} Students)`}
                                                </span>
                                                <ChevronRight size={16} aria-hidden="true" />
                                            </div>
                                        </Card>
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    /* LEVEL 2: DRILL DOWN INTO SELECTED CLASS */
                    <motion.div
                        key={`class-detail-${selectedClassId}`}
                        initial={{ opacity: 0, x: 14 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 14 }}
                        transition={{ duration: 0.22 }}
                        className="space-y-6"
                    >
                        {/* Back navigation */}
                        <div>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedClassId(null);
                                    setStudentSearch("");
                                }}
                                className="-my-2 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-primary transition-transform hover:-translate-x-0.5 hover:underline"
                            >
                                <ArrowLeft size={16} aria-hidden="true" />
                                <span>{locale === "id" ? "Kembali ke Semua Kelas" : "Back to All Classes"}</span>
                            </button>
                        </div>

                        {/* Class Header Banner */}
                        <Card className="glass border-white/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <span className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-primary text-white shadow-soft shrink-0">
                                    <GraduationCap size={26} aria-hidden="true" />
                                </span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                            {currentClass.name}
                                        </h2>
                                    </div>
                                    <p className="text-sm text-muted mt-0.5">
                                        {currentClass.students.length} {t.students.student}{" "}
                                        {locale === "id" ? "terdaftar" : "enrolled"}
                                    </p>
                                </div>
                            </div>

                            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
                                <ButtonLink
                                    href="/students/manage"
                                    variant="outline"
                                    size="sm"
                                    className="h-11 min-w-0 px-3 sm:h-9 sm:px-4"
                                >
                                    <Settings size={15} aria-hidden="true" className="shrink-0" />
                                    <span className="truncate">{t.students.manageClasses}</span>
                                </ButtonLink>
                                <ButtonLink href="/quick-check" size="sm" className="h-11 min-w-0 px-3 sm:h-9 sm:px-4">
                                    <Plus size={15} aria-hidden="true" className="shrink-0" />
                                    <span className="truncate">{t.myInterventions.btnNew}</span>
                                </ButtonLink>
                            </div>
                        </Card>

                        {/* Search Students within Class */}
                        <Card className="glass border-white/60 p-3.5 flex items-center gap-3">
                            <Search className="text-muted shrink-0" size={18} aria-hidden="true" />
                            <input
                                type="search"
                                placeholder={
                                    locale === "id"
                                        ? `Cari siswa di ${currentClass.name}...`
                                        : `Search students in ${currentClass.name}...`
                                }
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                className="w-full border-0 bg-transparent p-0 focus:outline-none text-sm placeholder:text-muted"
                            />
                        </Card>

                        {/* Student Grid */}
                        {filteredStudents.length === 0 ? (
                            <Card className="glass border-white/60 p-12 text-center text-muted space-y-4">
                                <UserRound size={36} className="mx-auto text-muted/60" aria-hidden="true" />
                                <div className="space-y-1">
                                    <p className="font-semibold text-foreground">
                                        {studentSearch
                                            ? locale === "id"
                                                ? "Tidak ada siswa yang cocok dengan pencarian."
                                                : "No students matching your search."
                                            : t.students.noStudentsInClass}
                                    </p>
                                    {!studentSearch && (
                                        <p className="text-xs text-muted max-w-sm mx-auto">
                                            {locale === "id"
                                                ? "Tambahkan siswa ke kelas ini melalui menu Kelola Kelas."
                                                : "Add students to this class in the Manage Classes section."}
                                        </p>
                                    )}
                                </div>
                                {!studentSearch && (
                                    <ButtonLink href="/students/manage" variant="soft" size="sm" className="mt-2">
                                        <Plus size={15} aria-hidden="true" />
                                        <span>{locale === "id" ? "Tambah Siswa Sekarang" : "Add Student Now"}</span>
                                    </ButtonLink>
                                )}
                            </Card>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                                {filteredStudents.map((s) => (
                                    <Link
                                        key={s.id}
                                        href={`/students/${s.id}`}
                                        className="group block rounded-[var(--radius-card)]"
                                    >
                                        <Card
                                            interactive
                                            className="flex h-full flex-col justify-between space-y-3 border-white/60 p-4 glass transition-all duration-200 hover:border-primary/50 hover:shadow-soft sm:space-y-4 sm:p-5"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary-strong group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all shadow-xs shrink-0">
                                                    <UserRound size={22} aria-hidden="true" />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-base sm:text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                        {s.name}
                                                    </h3>
                                                    <p className="text-xs text-muted truncate">{currentClass.name}</p>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-line/50 flex items-center justify-between text-xs font-semibold text-primary">
                                                <span>{t.students.viewProfile}</span>
                                                <ArrowRight
                                                    size={14}
                                                    className="transition-transform group-hover:translate-x-1"
                                                    aria-hidden="true"
                                                />
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
