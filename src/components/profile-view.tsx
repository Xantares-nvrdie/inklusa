"use client";

import {
    Camera,
    Check,
    CheckCircle2,
    GraduationCap,
    KeyRound,
    Lock,
    LogOut,
    Mail,
    RefreshCw,
    Shield,
    Sparkles,
    Trash2,
    Upload,
    User,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { authClient, signOut } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n/context";

export interface UserProfileData {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string | null;
    createdAt: string;
}

// Modern preset avatars (data URIs with joyful gradients and minimalist shapes)
const PRESET_AVATARS = [
    {
        id: "avatar-teacher-1",
        label: "Guru Ceria",
        dataUri:
            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g1' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%231f7a70'/><stop offset='100%' stop-color='%237fd1c4'/></linearGradient></defs><rect width='100' height='100' rx='50' fill='url(%23g1)'/><circle cx='50' cy='40' r='18' fill='%23ffffff'/><path d='M22 84c0-15 12-26 28-26s28 11 28 26' fill='%23ffffff'/><circle cx='44' cy='39' r='2' fill='%231f7a70'/><circle cx='56' cy='39' r='2' fill='%231f7a70'/><path d='M46 45q4 4 8 0' stroke='%231f7a70' stroke-width='2' fill='none' stroke-linecap='round'/></svg>",
    },
    {
        id: "avatar-teacher-2",
        label: "Pendidik Hangat",
        dataUri:
            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g2' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23d97706'/><stop offset='100%' stop-color='%23fcd34d'/></linearGradient></defs><rect width='100' height='100' rx='50' fill='url(%23g2)'/><circle cx='50' cy='38' r='17' fill='%23ffffff'/><path d='M24 85c0-14 11-25 26-25s26 11 26 25' fill='%23ffffff'/><circle cx='45' cy='37' r='2' fill='%23d97706'/><circle cx='55' cy='37' r='2' fill='%23d97706'/><path d='M47 43q3 3 6 0' stroke='%23d97706' stroke-width='2' fill='none' stroke-linecap='round'/></svg>",
    },
    {
        id: "avatar-specialist",
        label: "Spesialis Inklusi",
        dataUri:
            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g3' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%232563eb'/><stop offset='100%' stop-color='%2393c5fd'/></linearGradient></defs><rect width='100' height='100' rx='50' fill='url(%23g3)'/><circle cx='50' cy='39' r='18' fill='%23ffffff'/><path d='M23 85c0-15 12-26 27-26s27 11 27 26' fill='%23ffffff'/><circle cx='44' cy='38' r='2' fill='%232563eb'/><circle cx='56' cy='38' r='2' fill='%232563eb'/><path d='M45 44q5 4 10 0' stroke='%232563eb' stroke-width='2' fill='none' stroke-linecap='round'/></svg>",
    },
    {
        id: "avatar-creative",
        label: "Konselor Kreatif",
        dataUri:
            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g4' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%237c3aed'/><stop offset='100%' stop-color='%23c4b5fd'/></linearGradient></defs><rect width='100' height='100' rx='50' fill='url(%23g4)'/><circle cx='50' cy='39' r='17' fill='%23ffffff'/><path d='M24 85c0-14 11-25 26-25s26 11 26 25' fill='%23ffffff'/><circle cx='45' cy='38' r='2' fill='%237c3aed'/><circle cx='55' cy='38' r='2' fill='%237c3aed'/><path d='M47 44q3 3 6 0' stroke='%237c3aed' stroke-width='2' fill='none' stroke-linecap='round'/></svg>",
    },
    {
        id: "avatar-star",
        label: "Bintang Inspiratif",
        dataUri:
            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g5' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23e11d48'/><stop offset='100%' stop-color='%23fda4af'/></linearGradient></defs><rect width='100' height='100' rx='50' fill='url(%23g5)'/><polygon points='50,18 58,35 77,37 63,50 67,69 50,59 33,69 37,50 23,37 42,35' fill='%23ffffff'/></svg>",
    },
    {
        id: "avatar-owl",
        label: "Burung Hantu Bijak",
        dataUri:
            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g6' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23059669'/><stop offset='100%' stop-color='%236ee7b7'/></linearGradient></defs><rect width='100' height='100' rx='50' fill='url(%23g6)'/><circle cx='50' cy='50' r='30' fill='%23ffffff'/><circle cx='40' cy='46' r='8' fill='%23059669'/><circle cx='60' cy='46' r='8' fill='%23059669'/><circle cx='40' cy='46' r='3' fill='%23ffffff'/><circle cx='60' cy='46' r='3' fill='%23ffffff'/><polygon points='50,52 46,60 54,60' fill='%23f59e0b'/></svg>",
    },
];

export function ProfileView({ isAdmin = false }: { isAdmin?: boolean }) {
    const { locale } = useLanguage();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [image, setImage] = useState<string | null>(null);

    // Password change states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Fetch profile
    useEffect(() => {
        setLoading(true);
        api<UserProfileData>("/profile")
            .then((data) => {
                setProfile(data);
                setName(data.name || "");
                setImage(data.image || null);
            })
            .catch((err) => {
                setMessage({ type: "error", text: err.message || "Gagal memuat profil." });
            })
            .finally(() => setLoading(false));
    }, []);

    // Handle image file upload with client-side canvas compression
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setMessage({ type: "error", text: "Mohon pilih file gambar yang valid (JPG, PNG, atau WebP)." });
            return;
        }

        // Limit size to max 8MB before compression
        if (file.size > 8 * 1024 * 1024) {
            setMessage({ type: "error", text: "Ukuran gambar terlalu besar (maksimal 8MB)." });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = document.createElement("img");
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_SIZE = 400; // max 400x400 for crisp, lightweight avatar
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height = Math.round((height * MAX_SIZE) / width);
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width = Math.round((width * MAX_SIZE) / height);
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedDataUri = canvas.toDataURL("image/webp", 0.85);
                    setImage(compressedDataUri);
                    setMessage({
                        type: "success",
                        text: "Foto profil dipilih. Klik 'Simpan Perubahan' untuk menerapkan.",
                    });
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    // Save profile details
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setMessage({ type: "error", text: "Nama tidak boleh kosong." });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            // Update through Elysia profile API endpoint
            const updated = await api<UserProfileData>("/profile", {
                method: "PATCH",
                body: JSON.stringify({
                    name: name.trim(),
                    image: image,
                }),
            });

            // Also synchronize with Better Auth client if available
            try {
                await authClient.updateUser({
                    name: name.trim(),
                    image: image || undefined,
                });
            } catch {
                // Background sync
            }

            setProfile(updated);
            setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
            router.refresh();
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : "Gagal menyimpan perubahan profil.";
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setSaving(false);
        }
    };

    // Handle change password
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (!currentPassword) {
            setPasswordMessage({ type: "error", text: "Mohon isi kata sandi saat ini." });
            return;
        }
        if (newPassword.length < 8) {
            setPasswordMessage({ type: "error", text: "Kata sandi baru minimal 8 karakter." });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: "error", text: "Konfirmasi kata sandi baru tidak cocok." });
            return;
        }

        setChangingPassword(true);
        try {
            const res = await authClient.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: false,
            });

            if (res.error) {
                setPasswordMessage({
                    type: "error",
                    text: res.error.message || "Gagal mengubah kata sandi. Pastikan kata sandi lama benar.",
                });
            } else {
                setPasswordMessage({ type: "success", text: "Kata sandi berhasil diubah!" });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mengubah kata sandi.";
            setPasswordMessage({ type: "error", text: msg });
        } finally {
            setChangingPassword(false);
        }
    };

    const userInitials = (name || profile?.name || "U")
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();

    const formattedJoinDate = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : "—";

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            {/* Page Title & Breadcrumb */}
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
                    {locale === "id" ? "Profil Pengguna" : "User Profile"}
                </h1>
                <p className="text-sm sm:text-base text-muted">
                    {locale === "id"
                        ? "Kelola identitas akun, foto profil, dan kredensial keamanan Anda."
                        : "Manage your account identity, profile picture, and security credentials."}
                </p>
            </div>

            {loading ? (
                <div className="h-64 animate-pulse rounded-3xl bg-surface-2" />
            ) : (
                <div className="space-y-8">
                    {/* Header Banner: Avatar & Identity Card */}
                    <Card className="glass border-white/60 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-3xl overflow-hidden shadow-lift border-2 border-white/80 bg-surface-2 flex items-center justify-center">
                                {image ? (
                                    <Image
                                        src={image}
                                        alt={name || "Avatar"}
                                        width={128}
                                        height={128}
                                        className="h-full w-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary to-accent text-white font-display text-4xl font-bold">
                                        {userInitials}
                                    </div>
                                )}
                            </div>

                            {/* Camera overlay button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="cursor-pointer absolute -bottom-2 -right-2 grid h-10 w-10 place-items-center rounded-2xl bg-primary text-white shadow-soft transition-transform hover:scale-110 active:scale-95"
                                title="Ubah foto profil"
                                aria-label="Ubah foto profil"
                            >
                                <Camera size={18} />
                            </button>
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleFileUpload}
                            className="hidden"
                            aria-label="Pilih foto profil"
                        />

                        {/* Identity Info */}
                        <div className="flex-1 text-center sm:text-left space-y-2">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                                    {name || profile?.name}
                                </h2>
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                        isAdmin || profile?.role === "ADMIN"
                                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-300/40"
                                            : "bg-primary-soft text-primary-strong border border-primary/20"
                                    }`}
                                >
                                    {isAdmin || profile?.role === "ADMIN" ? (
                                        <>
                                            <Shield size={13} />
                                            <span>Administrator</span>
                                        </>
                                    ) : (
                                        <>
                                            <GraduationCap size={13} />
                                            <span>{locale === "id" ? "Guru / Pendidik" : "Teacher"}</span>
                                        </>
                                    )}
                                </span>
                            </div>

                            <p className="text-sm text-muted flex items-center justify-center sm:justify-start gap-1.5">
                                <Mail size={15} className="shrink-0" />
                                <span>{profile?.email}</span>
                            </p>

                            <p className="text-xs text-muted pt-1">
                                {locale === "id" ? "Bergabung sejak:" : "Member since:"} {formattedJoinDate}
                            </p>
                        </div>
                    </Card>

                    {/* Section 1: Edit Profile (Name & Picture) */}
                    <Card className="glass border-white/60 p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-2.5 border-b border-line/50 pb-4">
                            <User size={20} className="text-primary" />
                            <h3 className="text-xl font-bold text-foreground">
                                {locale === "id" ? "Informasi Akun & Foto" : "Account Info & Photo"}
                            </h3>
                        </div>

                        {message && (
                            <div
                                role="alert"
                                className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-medium ${
                                    message.type === "success"
                                        ? "bg-success/10 text-success border border-success/30"
                                        : "bg-danger/10 text-danger border border-danger/30"
                                }`}
                            >
                                {message.type === "success" ? (
                                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                                ) : (
                                    <Shield size={18} className="shrink-0 mt-0.5" />
                                )}
                                <span>{message.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            {/* Profile Picture Actions */}
                            <div className="space-y-3">
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                                    {locale === "id" ? "Pilihan Foto Profil" : "Profile Picture Options"}
                                </label>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="rounded-xl gap-2 text-xs font-semibold"
                                    >
                                        <Upload size={15} />
                                        <span>{locale === "id" ? "Unggah dari Galeri" : "Upload Image"}</span>
                                    </Button>

                                    {image && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setImage(null);
                                                setMessage({
                                                    type: "success",
                                                    text: "Foto profil dihapus (menggunakan inisial). Klik 'Simpan Perubahan' untuk menerapkan.",
                                                });
                                            }}
                                            className="rounded-xl gap-1.5 text-xs font-semibold text-danger hover:bg-danger/10 hover:text-danger"
                                        >
                                            <Trash2 size={14} />
                                            <span>{locale === "id" ? "Hapus Foto" : "Remove Picture"}</span>
                                        </Button>
                                    )}
                                </div>

                                {/* Preset Avatars Quick Gallery */}
                                <div className="space-y-2 pt-2">
                                    <p className="text-xs text-muted flex items-center gap-1.5">
                                        <Sparkles size={14} className="text-accent" />
                                        <span>
                                            {locale === "id"
                                                ? "Atau pilih avatar siap pakai:"
                                                : "Or pick a preset avatar:"}
                                        </span>
                                    </p>
                                    <div className="flex flex-wrap gap-2.5">
                                        {PRESET_AVATARS.map((preset) => {
                                            const isSelected = image === preset.dataUri;
                                            return (
                                                <button
                                                    key={preset.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setImage(preset.dataUri);
                                                        setMessage({
                                                            type: "success",
                                                            text: `Avatar "${preset.label}" dipilih. Klik 'Simpan Perubahan' untuk menerapkan.`,
                                                        });
                                                    }}
                                                    className={`cursor-pointer group relative h-12 w-12 rounded-2xl overflow-hidden border-2 transition-all p-0.5 ${
                                                        isSelected
                                                            ? "border-primary ring-2 ring-primary/30 scale-105"
                                                            : "border-line/70 hover:border-primary/50 hover:scale-105"
                                                    }`}
                                                    title={preset.label}
                                                >
                                                    <Image
                                                        src={preset.dataUri}
                                                        alt={preset.label}
                                                        width={48}
                                                        height={48}
                                                        className="h-full w-full object-cover rounded-xl"
                                                        unoptimized
                                                    />
                                                    {isSelected && (
                                                        <span className="absolute inset-0 bg-primary/25 grid place-items-center rounded-xl text-white">
                                                            <Check size={18} strokeWidth={3} />
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Name Input */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="profile-name-input"
                                    className="block text-xs font-bold uppercase tracking-wider text-muted"
                                >
                                    {locale === "id" ? "Nama Lengkap" : "Full Name"}
                                </label>
                                <Input
                                    id="profile-name-input"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nama lengkap Anda..."
                                    required
                                    maxLength={100}
                                    className="h-11 rounded-xl text-sm"
                                />
                            </div>

                            {/* Email Display (Read-Only) */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="profile-email-input"
                                    className="block text-xs font-bold uppercase tracking-wider text-muted"
                                >
                                    {locale === "id" ? "Alamat Email (Akun)" : "Email Address"}
                                </label>
                                <Input
                                    id="profile-email-input"
                                    type="email"
                                    value={profile?.email || ""}
                                    disabled
                                    className="h-11 rounded-xl text-sm bg-surface-2 text-muted cursor-not-allowed opacity-80"
                                />
                                <p className="text-[11px] text-muted">
                                    {locale === "id"
                                        ? "Email digunakan untuk identitas autentikasi Anda."
                                        : "Email is used as your unique login identifier."}
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm shadow-xs"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw size={16} className="mr-2 animate-spin" />
                                        <span>{locale === "id" ? "Menyimpan..." : "Saving..."}</span>
                                    </>
                                ) : (
                                    <span>{locale === "id" ? "Simpan Perubahan Profil" : "Save Changes"}</span>
                                )}
                            </Button>
                        </form>
                    </Card>

                    {/* Section 2: Change Password */}
                    <Card className="glass border-white/60 p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-2.5 border-b border-line/50 pb-4">
                            <KeyRound size={20} className="text-primary" />
                            <h3 className="text-xl font-bold text-foreground">
                                {locale === "id" ? "Keamanan & Kata Sandi" : "Security & Password"}
                            </h3>
                        </div>

                        {passwordMessage && (
                            <div
                                role="alert"
                                className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-medium ${
                                    passwordMessage.type === "success"
                                        ? "bg-success/10 text-success border border-success/30"
                                        : "bg-danger/10 text-danger border border-danger/30"
                                }`}
                            >
                                {passwordMessage.type === "success" ? (
                                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                                ) : (
                                    <Lock size={18} className="shrink-0 mt-0.5" />
                                )}
                                <span>{passwordMessage.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="profile-current-password"
                                    className="block text-xs font-bold uppercase tracking-wider text-muted"
                                >
                                    {locale === "id" ? "Kata Sandi Saat Ini" : "Current Password"}
                                </label>
                                <Input
                                    id="profile-current-password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="h-11 rounded-xl text-sm"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="profile-new-password"
                                        className="block text-xs font-bold uppercase tracking-wider text-muted"
                                    >
                                        {locale === "id" ? "Kata Sandi Baru" : "New Password"}
                                    </label>
                                    <Input
                                        id="profile-new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Minimal 8 karakter..."
                                        required
                                        minLength={8}
                                        className="h-11 rounded-xl text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="profile-confirm-password"
                                        className="block text-xs font-bold uppercase tracking-wider text-muted"
                                    >
                                        {locale === "id" ? "Konfirmasi Kata Sandi Baru" : "Confirm New Password"}
                                    </label>
                                    <Input
                                        id="profile-confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Ulangi kata sandi baru..."
                                        required
                                        minLength={8}
                                        className="h-11 rounded-xl text-sm"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="outline"
                                disabled={changingPassword}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm"
                            >
                                {changingPassword ? (
                                    <>
                                        <RefreshCw size={16} className="mr-2 animate-spin" />
                                        <span>{locale === "id" ? "Mengubah Kata Sandi..." : "Updating..."}</span>
                                    </>
                                ) : (
                                    <span>{locale === "id" ? "Perbarui Kata Sandi" : "Update Password"}</span>
                                )}
                            </Button>
                        </form>
                    </Card>

                    {/* Section 3: Logout Action */}
                    <Card className="glass border-white/60 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-0.5 text-center sm:text-left">
                            <h4 className="font-bold text-sm text-foreground">
                                {locale === "id" ? "Keluar dari Akun" : "Sign Out"}
                            </h4>
                            <p className="text-xs text-muted">
                                {locale === "id"
                                    ? "Akhiri sesi aktif Anda di perangkat ini."
                                    : "Terminate your active session on this device."}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                                await signOut();
                                router.push("/");
                                router.refresh();
                            }}
                            className="w-full sm:w-auto text-danger hover:bg-danger/10 hover:text-danger rounded-xl text-xs font-bold gap-2"
                        >
                            <LogOut size={15} />
                            <span>{locale === "id" ? "Keluar" : "Sign Out"}</span>
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}
