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

export function AuthForm({ mode }: { mode: "login" | "register" }) {
    const router = useRouter();
    const { t } = useLanguage();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const isLogin = mode === "login";

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
                <Button id="btn-auth-submit" type="submit" size="lg" className="w-full" disabled={loading}>
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
