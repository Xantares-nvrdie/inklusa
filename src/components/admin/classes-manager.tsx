"use client";

import { Search, Plus, Trash2, Pencil } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
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
    const [search, setSearch] = useState("");

    const [newClassName, setNewClassName] = useState("");
    const [isCreatingClass, setIsCreatingClass] = useState(false);

    const [newStudentName, setNewStudentName] = useState("");
    const [addingToClassId, setAddingToClassId] = useState<string | null>(null);

    const [editingClassId, setEditingClassId] = useState<string | null>(null);
    const [editClassName, setEditClassName] = useState("");

    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    const [editStudentName, setEditStudentName] = useState("");

    const loadClasses = () => {
        api<Class[]>("/students/classes")
            .then(setClasses)
            .catch(() => setClasses([]));
    };

    useEffect(() => {
        loadClasses();
    }, []);

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newClassName.trim();
        if (!name) return;
        setIsCreatingClass(true);
        try {
            await api("/students/classes", { method: "POST", body: JSON.stringify({ name }) });
            setNewClassName("");
            loadClasses();
        } finally {
            setIsCreatingClass(false);
        }
    };

    const handleAddStudent = async (e: React.FormEvent, classId: string) => {
        e.preventDefault();
        const name = newStudentName.trim();
        if (!name) return;
        try {
            await api("/students", { method: "POST", body: JSON.stringify({ classId, name }) });
            setNewStudentName("");
            setAddingToClassId(null);
            loadClasses();
        } catch (error) {
            console.error("Failed to add student", error);
        }
    };

    const handleDeleteClass = async (id: string) => {
        if (!confirm(a.confirmDeleteClass)) return;
        try {
            await api(`/students/classes/${id}`, { method: "DELETE" });
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

    const filtered = useMemo(() => {
        if (!classes) return null;
        if (!search) return classes;
        const s = search.toLowerCase();
        return classes.filter(
            (c) => c.name.toLowerCase().includes(s) || c.students.some((st) => st.name.toLowerCase().includes(s)),
        );
    }, [classes, search]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{a.title}</h1>
                <p className="text-muted">{a.sub}</p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <Input
                        type="search"
                        placeholder={a.search}
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <Card className="glass border-white/60 p-6 space-y-4">
                <form onSubmit={handleCreateClass} className="flex gap-2">
                    <Input 
                        placeholder={a.name} 
                        value={newClassName} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClassName(e.target.value)} 
                        maxLength={50}
                        required 
                    />
                    <Button type="submit" disabled={isCreatingClass || !newClassName.trim()}>{a.addClass}</Button>
                </form>
            </Card>

            {!filtered ? (
                <div className="h-40 animate-pulse rounded-card bg-surface-2" />
            ) : filtered.length === 0 ? (
                <Card className="glass border-white/60 p-10 text-center text-muted">
                    {a.empty}
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {filtered.map((c) => (
                        <Card key={c.id} className="glass border-white/60 p-0 overflow-hidden flex flex-col">
                            <div className="bg-surface-2 p-4 border-b border-line/70 flex items-center justify-between">
                                {editingClassId === c.id ? (
                                    <form onSubmit={(e) => handleEditClass(e, c.id)} className="flex gap-2 flex-1 mr-2">
                                        <Input
                                            value={editClassName}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditClassName(e.target.value)}
                                            maxLength={50}
                                            required
                                            autoFocus
                                            className="h-8 text-sm"
                                        />
                                        <Button size="sm" type="submit">{t.admin.save}</Button>
                                        <Button size="sm" type="button" variant="ghost" onClick={() => setEditingClassId(null)}>{a.cancel}</Button>
                                    </form>
                                ) : (
                                    <>
                                        <div>
                                            <h3 className="font-bold text-lg">{c.name}</h3>
                                            <p className="text-xs text-muted">{c.students.length} {a.students}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted" onClick={() => { setEditingClassId(c.id); setEditClassName(c.name); }}>
                                                <Pencil size={14} />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-danger hover:bg-danger/10 hover:text-danger" onClick={() => handleDeleteClass(c.id)}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="p-4 flex-1">
                                {c.students.length > 0 ? (
                                    <ul className="space-y-2 mb-4">
                                        {c.students.map((st) => (
                                            <li key={st.id} className="text-sm font-medium px-3 py-1.5 bg-surface rounded-md border border-line/50 text-foreground flex items-center justify-between group">
                                                {editingStudentId === st.id ? (
                                                    <form onSubmit={(e) => handleEditStudent(e, st.id)} className="flex gap-2 flex-1">
                                                        <Input
                                                            value={editStudentName}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditStudentName(e.target.value)}
                                                            maxLength={50}
                                                            required
                                                            autoFocus
                                                            className="h-7 text-sm py-1"
                                                        />
                                                        <Button size="sm" type="submit" className="h-7 text-xs">{t.admin.save}</Button>
                                                        <Button size="sm" type="button" variant="ghost" className="h-7 text-xs" onClick={() => setEditingStudentId(null)}>{a.cancel}</Button>
                                                    </form>
                                                ) : (
                                                    <>
                                                        <span>{st.name}</span>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button type="button" className="text-muted hover:text-foreground p-1 rounded" onClick={() => { setEditingStudentId(st.id); setEditStudentName(st.name); }}>
                                                                <Pencil size={12} />
                                                            </button>
                                                            <button type="button" className="text-danger hover:text-danger p-1 rounded" onClick={() => handleDeleteStudent(st.id)}>
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted mb-4 italic">Belum ada siswa.</p>
                                )}

                                {addingToClassId === c.id ? (
                                    <form onSubmit={(e) => handleAddStudent(e, c.id)} className="flex gap-2">
                                        <Input 
                                            placeholder={a.studentName} 
                                            value={newStudentName} 
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStudentName(e.target.value)} 
                                            maxLength={50}
                                            required 
                                            autoFocus
                                        />
                                        <Button size="sm" type="submit" disabled={!newStudentName.trim()}>{a.addStudent}</Button>
                                        <Button size="sm" type="button" variant="ghost" onClick={() => { setAddingToClassId(null); setNewStudentName(""); }}>{a.cancel}</Button>
                                    </form>
                                ) : (
                                    <Button size="sm" variant="soft" onClick={() => setAddingToClassId(c.id)}>
                                        <Plus size={16} className="mr-1" /> {a.addStudent}
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
