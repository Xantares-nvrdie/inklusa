"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, GraduationCap, Pencil, Plus, Search, Trash2, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { adminDict } from "@/lib/i18n/admin";
import { useLanguage } from "@/lib/i18n/context";

interface Student {
    id: string;
    name: string;
}

interface Class {
    id: string;
    name: string;
    students: Student[];
}

export function ClassesManager() {
    const { locale } = useLanguage();
    const a = adminDict[locale].classes;

    const [classes, setClasses] = useState<Class[] | null>(null);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [studentSearch, setStudentSearch] = useState("");

    const [newClassName, setNewClassName] = useState("");
    const [isCreatingClass, setIsCreatingClass] = useState(false);

    const [newStudentName, setNewStudentName] = useState("");
    const [isAddingStudent, setIsAddingStudent] = useState(false);

    const [editingClassId, setEditingClassId] = useState<string | null>(null);
    const [editClassName, setEditClassName] = useState("");

    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    const [editStudentName, setEditStudentName] = useState("");

    const loadClasses = useCallback(() => {
        api<Class[]>("/students/classes")
            .then(setClasses)
            .catch(() => setClasses([]));
    }, []);

    useEffect(() => {
        loadClasses();
    }, [loadClasses]);

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newClassName.trim();
        if (!name) return;
        setIsCreatingClass(true);
        try {
            const created = await api<Class>("/students/classes", { method: "POST", body: JSON.stringify({ name }) });
            setNewClassName("");
            loadClasses();
            if (created?.id) {
                setSelectedClassId(created.id);
            }
        } finally {
            setIsCreatingClass(false);
        }
    };

    const handleAddStudent = async (e: React.FormEvent, classId: string) => {
        e.preventDefault();
        const name = newStudentName.trim();
        if (!name) return;
        setIsAddingStudent(true);
        try {
            await api("/students", { method: "POST", body: JSON.stringify({ classId, name }) });
            setNewStudentName("");
            loadClasses();
        } catch (error) {
            console.error("Failed to add student", error);
        } finally {
            setIsAddingStudent(false);
        }
    };

    const handleDeleteClass = async (id: string) => {
        if (!confirm(a.confirmDeleteClass)) return;
        try {
            await api(`/students/classes/${id}`, { method: "DELETE" });
            if (selectedClassId === id) {
                setSelectedClassId(null);
            }
            loadClasses();
        } catch (error) {
            console.error("Failed to delete class", error);
        }
    };

    const handleEditClass = async (e: React.FormEvent, id: string) => {
        e.preventDefault();
        const name = editClassName.trim();
        if (!name) return;
        try {
            await api(`/students/classes/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
            setEditingClassId(null);
            setEditClassName("");
            loadClasses();
        } catch (error) {
            console.error("Failed to edit class", error);
        }
    };

    const handleDeleteStudent = async (id: string) => {
        if (!confirm(a.confirmDeleteStudent)) return;
        try {
            await api(`/students/${id}`, { method: "DELETE" });
            loadClasses();
        } catch (error) {
            console.error("Failed to delete student", error);
        }
    };

    const handleEditStudent = async (e: React.FormEvent, id: string) => {
        e.preventDefault();
        const name = editStudentName.trim();
        if (!name) return;
        try {
            await api(`/students/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
            setEditingStudentId(null);
            setEditStudentName("");
            loadClasses();
        } catch (error) {
            console.error("Failed to edit student", error);
        }
    };

    const filteredClasses = useMemo(() => {
        if (!classes) return null;
        if (!search.trim()) return classes;
        const s = search.toLowerCase();
        return classes.filter(
            (c) => c.name.toLowerCase().includes(s) || c.students.some((st) => st.name.toLowerCase().includes(s)),
        );
    }, [classes, search]);

    const currentClass = selectedClassId ? classes?.find((c) => c.id === selectedClassId) : null;

    const filteredStudents = useMemo(() => {
        if (!currentClass) return [];
        if (!studentSearch.trim()) return currentClass.students;
        const q = studentSearch.toLowerCase();
        return currentClass.students.filter((st) => st.name.toLowerCase().includes(q));
    }, [currentClass, studentSearch]);

    return (
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                {!selectedClassId || !currentClass ? (
                    <motion.div
                        key="class-list-view"
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -14 }}
                        transition={{ duration: 0.22 }}
                        className="space-y-6"
                    >
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{a.title}</h1>
                            <p className="mt-1 text-muted">{a.sub}</p>
                        </div>

                        {/* Search and Add Class Card */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="glass border-white/60 p-4 flex items-center gap-3">
                                <Search className="text-muted shrink-0" size={18} />
                                <Input
                                    type="search"
                                    placeholder={a.search}
                                    value={search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                    className="border-0 bg-transparent p-0 focus-visible:ring-0 shadow-none text-sm placeholder:text-muted"
                                />
                            </Card>

                            <Card className="glass border-white/60 p-4">
                                <form onSubmit={handleCreateClass} className="flex gap-2">
                                    <Input
                                        placeholder={a.name}
                                        value={newClassName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setNewClassName(e.target.value)
                                        }
                                        maxLength={50}
                                        required
                                        className="h-10 text-sm"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isCreatingClass || !newClassName.trim()}
                                        className="shrink-0"
                                    >
                                        <Plus size={16} className="mr-1" /> {a.addClass}
                                    </Button>
                                </form>
                            </Card>
                        </div>

                        {/* Class Grid */}
                        {!filteredClasses ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3, 4, 5, 6].map((idx) => (
                                    <div key={idx} className="h-32 animate-pulse rounded-2xl bg-surface-2" />
                                ))}
                            </div>
                        ) : filteredClasses.length === 0 ? (
                            <Card className="glass border-white/60 p-12 text-center text-muted space-y-2">
                                <GraduationCap size={36} className="mx-auto text-muted/60" />
                                <p className="font-medium">{a.empty}</p>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredClasses.map((c) => {
                                    const isEditing = editingClassId === c.id;

                                    return (
                                        <Card
                                            key={c.id}
                                            className="group relative glass border-white/60 p-5 flex flex-col justify-between transition-all duration-200 hover:border-primary/50 hover:shadow-soft hover:-translate-y-0.5"
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-strong group-hover:bg-primary group-hover:text-white transition-colors shadow-xs">
                                                            <GraduationCap size={22} aria-hidden="true" />
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            {isEditing ? (
                                                                <form
                                                                    onSubmit={(e) => handleEditClass(e, c.id)}
                                                                    className="flex items-center gap-1.5"
                                                                >
                                                                    <Input
                                                                        value={editClassName}
                                                                        onChange={(
                                                                            e: React.ChangeEvent<HTMLInputElement>,
                                                                        ) => setEditClassName(e.target.value)}
                                                                        maxLength={50}
                                                                        required
                                                                        className="h-8 text-sm"
                                                                    />
                                                                    <Button
                                                                        size="sm"
                                                                        type="submit"
                                                                        className="h-8 px-2.5 text-xs"
                                                                    >
                                                                        {a.save}
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        type="button"
                                                                        variant="ghost"
                                                                        className="h-8 px-2 text-xs"
                                                                        onClick={() => setEditingClassId(null)}
                                                                    >
                                                                        {a.cancel}
                                                                    </Button>
                                                                </form>
                                                            ) : (
                                                                <h3 className="font-bold text-lg text-foreground truncate">
                                                                    {c.name}
                                                                </h3>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-muted">
                                                                    {c.students.length} {a.students}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {!isEditing && (
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-muted hover:text-foreground"
                                                                title={a.edit}
                                                                onClick={() => {
                                                                    setEditingClassId(c.id);
                                                                    setEditClassName(c.name);
                                                                }}
                                                            >
                                                                <Pencil size={14} />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-danger hover:bg-danger/10 hover:text-danger"
                                                                title={a.del}
                                                                onClick={() => handleDeleteClass(c.id)}
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Preview students */}
                                                <div className="pt-2 border-t border-line/50 min-h-12 flex flex-col justify-center">
                                                    {c.students.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5 items-center">
                                                            {c.students.slice(0, 3).map((st) => (
                                                                <span
                                                                    key={st.id}
                                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-surface-2 text-foreground/80 max-w-28 truncate"
                                                                >
                                                                    <UserRound size={11} className="text-muted" />
                                                                    <span className="truncate">{st.name}</span>
                                                                </span>
                                                            ))}
                                                            {c.students.length > 3 && (
                                                                <span className="text-xs font-medium text-muted">
                                                                    +{c.students.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-muted italic">
                                                            {a.noStudentsInClass}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Drill-down action button */}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="mt-4 w-full justify-between rounded-xl border-line/70 hover:border-primary hover:bg-primary hover:text-white transition-all text-xs font-semibold py-2 h-auto"
                                                onClick={() => {
                                                    setSelectedClassId(c.id);
                                                    setStudentSearch("");
                                                }}
                                            >
                                                <span>{a.manageStudents}</span>
                                                <ChevronRight
                                                    size={16}
                                                    className="transition-transform group-hover:translate-x-1"
                                                />
                                            </Button>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                ) : (
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
                                    setEditingStudentId(null);
                                    setStudentSearch("");
                                }}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline hover:-translate-x-0.5 transition-transform cursor-pointer"
                            >
                                <ArrowLeft size={16} /> {a.backToClasses}
                            </button>
                        </div>

                        {/* Class Header Banner */}
                        <Card className="glass border-white/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-white shadow-soft shrink-0">
                                    <GraduationCap size={28} />
                                </span>
                                <div>
                                    {editingClassId === currentClass.id ? (
                                        <form
                                            onSubmit={(e) => handleEditClass(e, currentClass.id)}
                                            className="flex items-center gap-2"
                                        >
                                            <Input
                                                value={editClassName}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    setEditClassName(e.target.value)
                                                }
                                                maxLength={50}
                                                required
                                                className="h-9 font-bold text-lg"
                                            />
                                            <Button size="sm" type="submit">
                                                {a.save}
                                            </Button>
                                            <Button
                                                size="sm"
                                                type="button"
                                                variant="ghost"
                                                onClick={() => setEditingClassId(null)}
                                            >
                                                {a.cancel}
                                            </Button>
                                        </form>
                                    ) : (
                                        <div className="flex items-center gap-2.5">
                                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                                {currentClass.name}
                                            </h2>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-muted hover:text-foreground"
                                                title={a.edit}
                                                onClick={() => {
                                                    setEditingClassId(currentClass.id);
                                                    setEditClassName(currentClass.name);
                                                }}
                                            >
                                                <Pencil size={15} />
                                            </Button>
                                        </div>
                                    )}
                                    <p className="text-sm text-muted mt-0.5">
                                        {currentClass.students.length} {a.students}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-danger hover:bg-danger/10 hover:text-danger"
                                    onClick={() => handleDeleteClass(currentClass.id)}
                                >
                                    <Trash2 size={15} className="mr-1.5" /> {a.del} {a.name}
                                </Button>
                            </div>
                        </Card>

                        {/* Student Management Area */}
                        <div className="space-y-4">
                            {/* Toolbar: Add Student and Search */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card className="glass border-white/60 p-4 flex items-center gap-3">
                                    <Search className="text-muted shrink-0" size={18} />
                                    <Input
                                        type="search"
                                        placeholder={a.searchStudents}
                                        value={studentSearch}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setStudentSearch(e.target.value)
                                        }
                                        className="border-0 bg-transparent p-0 focus-visible:ring-0 shadow-none text-sm placeholder:text-muted"
                                    />
                                </Card>

                                <Card className="glass border-white/60 p-4">
                                    <form onSubmit={(e) => handleAddStudent(e, currentClass.id)} className="flex gap-2">
                                        <Input
                                            placeholder={a.studentName}
                                            value={newStudentName}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setNewStudentName(e.target.value)
                                            }
                                            maxLength={50}
                                            required
                                            className="h-10 text-sm"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={isAddingStudent || !newStudentName.trim()}
                                            className="shrink-0"
                                        >
                                            <Plus size={16} className="mr-1" /> {a.addStudent}
                                        </Button>
                                    </form>
                                </Card>
                            </div>

                            {/* Students List / Grid */}
                            {currentClass.students.length === 0 ? (
                                <Card className="glass border-white/60 p-12 text-center text-muted space-y-2">
                                    <UserRound size={36} className="mx-auto text-muted/60" />
                                    <p className="font-medium">{a.noStudentsInClass}</p>
                                    <p className="text-xs text-muted">
                                        {locale === "en"
                                            ? "Add your first student above to populate this class."
                                            : "Gunakan form di atas untuk menambahkan siswa pertama di kelas ini."}
                                    </p>
                                </Card>
                            ) : filteredStudents.length === 0 ? (
                                <Card className="glass border-white/60 p-10 text-center text-muted">
                                    <p className="text-sm">
                                        {locale === "en"
                                            ? "No students match your search."
                                            : "Tidak ada siswa yang cocok dengan pencarian."}
                                    </p>
                                </Card>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                                    {filteredStudents.map((st, idx) => {
                                        const isEditingThisStudent = editingStudentId === st.id;

                                        return (
                                            <Card
                                                key={st.id}
                                                className="glass border-white/60 p-4 flex items-center justify-between gap-3 group hover:border-primary/40 hover:shadow-xs transition-all"
                                            >
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-primary-strong font-medium text-xs">
                                                        {idx + 1}
                                                    </span>

                                                    {isEditingThisStudent ? (
                                                        <form
                                                            onSubmit={(e) => handleEditStudent(e, st.id)}
                                                            className="flex items-center gap-1.5 flex-1 min-w-0"
                                                        >
                                                            <Input
                                                                value={editStudentName}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                                    setEditStudentName(e.target.value)
                                                                }
                                                                maxLength={50}
                                                                required
                                                                className="h-8 text-sm"
                                                            />
                                                            <Button
                                                                size="sm"
                                                                type="submit"
                                                                className="h-8 px-2 text-xs"
                                                            >
                                                                {a.save}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                type="button"
                                                                variant="ghost"
                                                                className="h-8 px-2 text-xs"
                                                                onClick={() => setEditingStudentId(null)}
                                                            >
                                                                {a.cancel}
                                                            </Button>
                                                        </form>
                                                    ) : (
                                                        <div className="min-w-0 flex-1">
                                                            <span className="block font-semibold text-foreground truncate text-sm">
                                                                {st.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {!isEditingThisStudent && (
                                                    <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 w-7 p-0 text-muted hover:text-foreground"
                                                            title={a.edit}
                                                            onClick={() => {
                                                                setEditingStudentId(st.id);
                                                                setEditStudentName(st.name);
                                                            }}
                                                        >
                                                            <Pencil size={13} />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 w-7 p-0 text-danger hover:bg-danger/10 hover:text-danger"
                                                            title={a.del}
                                                            onClick={() => handleDeleteStudent(st.id)}
                                                        >
                                                            <Trash2 size={13} />
                                                        </Button>
                                                    </div>
                                                )}
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
