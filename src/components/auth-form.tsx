"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signIn, signUp } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n/context";

const inputCls =
    "h-12 w-full rounded-2xl border border-line bg-surface/80 px-4 text-base outline-none transition focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/15";

function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
        </svg>
    );
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
    const router = useRouter();
    const { t } = useLanguage();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const isLogin = mode === "login";

    async function handleGoogleSignIn() {
        setError(null);
        setGoogleLoading(true);
        try {
            const res = await signIn.social({
                provider: "google",
                callbackURL: "/dashboard",
            });
            if (res?.error) {
                setError(res.error.message ?? "Failed to sign in with Google");
                setGoogleLoading(false);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to sign in with Google");
            setGoogleLoading(false);
        }
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const f = new FormData(e.currentTarget);
        const email = String(f.get("email"));
        const password = String(f.get("password"));
        const res = isLogin
            ? await signIn.email({ email, password })
            : await signUp.email({ email, password, name: String(f.get("name")) });
        setLoading(false);
        if (res.error) {
            if ((res.error as any).code === "BANNED_USER" || res.error.status === 403) {
                setError(t.auth.pendingApproval);
            } else {
                setError(res.error.message ?? "Something went wrong. Please try again.");
            }
            return;
        }
        router.push("/dashboard");
        router.refresh();
    }

    return (
        <Card className="space-y-6 p-8 glass border-white/60">
            <div className="space-y-1.5">
                <h1 className="text-3xl font-bold">{isLogin ? t.auth.welcomeBack : t.auth.createAccount}</h1>
                <p className="text-muted">{isLogin ? t.auth.subLogin : t.auth.subRegister}</p>
            </div>

            <Button
                id="btn-auth-google"
                type="button"
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-3 border-line bg-surface hover:bg-surface-2 transition font-medium"
                disabled={loading || googleLoading}
                onClick={handleGoogleSignIn}
            >
                <GoogleIcon className="h-5 w-5 shrink-0" />
                <span>{googleLoading ? t.auth.pleaseWait : t.auth.btnGoogle}</span>
            </Button>

            <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-line" />
                <span className="absolute bg-surface px-3 text-xs text-muted uppercase tracking-wider">
                    {t.auth.orDivider}
                </span>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                {!isLogin && (
                    <div className="space-y-1.5">
                        <label htmlFor="name" className="text-sm font-medium">
                            {t.auth.name}
                        </label>
                        <input
                            id="name"
                            name="name"
                            required
                            autoComplete="name"
                            className={inputCls}
                            placeholder={t.auth.namePlaceholder}
                        />
                    </div>
                )}
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium">
                        {t.auth.email}
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className={inputCls}
                        placeholder="teacher@school.id"
                    />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="password" className="text-sm font-medium">
                        {t.auth.password}
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        className={inputCls}
                        placeholder={t.auth.passwordHint}
                    />
                </div>
                {error && (
                    <p role="alert" className="rounded-xl bg-[#fbe9e7] px-4 py-3 text-sm text-danger">
                        {error}
                    </p>
                )}
                <Button
                    id="btn-auth-submit"
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading || googleLoading}
                >
                    {loading ? t.auth.pleaseWait : isLogin ? t.auth.btnSignIn : t.auth.btnRegister}
                </Button>
            </form>
            <p className="text-center text-sm text-muted">
                {isLogin ? t.auth.dontHaveAccount : t.auth.alreadyHaveAccount}
                <Link href={isLogin ? "/register" : "/login"} className="font-semibold text-primary hover:underline">
                    {isLogin ? t.auth.btnRegister : t.auth.btnSignIn}
                </Link>
            </p>
        </Card>
    );
}
