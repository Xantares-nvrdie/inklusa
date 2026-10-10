"use client";

import { Home, Library, ListChecks, LogOut, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { signOut } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function AppNav({ name }: { name: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const { t } = useLanguage();

    const links = [
        { href: "/dashboard", label: t.nav.dashboard, Icon: Home },
        { href: "/action-plans", label: t.nav.myInterventions, Icon: ListChecks },
        { href: "/students", label: t.nav.students, Icon: Users },
        { href: "/interventions", label: t.nav.library, Icon: Library },
    ];

    return (
        <header className="sticky top-0 z-40 border-b border-line/70 glass">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5">
                <Logo href="/dashboard" />
                <nav className="hidden items-center gap-1 md:flex" aria-label="App">
                    {links.map(({ href, label, Icon }) => {
                        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                        return (
                            <Link
                                key={href}
                                href={href}
                                id={`nav-${label.toLowerCase().replace(/\s/g, "-")}`}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                                    active
                                        ? "bg-primary-soft text-primary-strong"
                                        : "text-muted hover:text-foreground hover:bg-surface-2",
                                )}
                            >
                                <Icon size={16} aria-hidden="true" />
                                <span className="hidden sm:inline">{label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="flex items-center gap-2 sm:gap-3">
                    <LanguageSwitcher />
                    <span className="hidden text-sm text-muted md:inline">{name}</span>
                    <button
                        id="btn-sign-out"
                        type="button"
                        onClick={async () => {
                            await signOut();
                            router.push("/");
                            router.refresh();
                        }}
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                        aria-label={t.nav.signOut}
                        title={t.nav.signOut}
                    >
                        <LogOut size={18} aria-hidden="true" />
                    </button>
                </div>
            </div>
            <nav
                className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 rounded-2xl border border-line/70 bg-surface/95 p-1.5 shadow-lift backdrop-blur md:hidden"
                aria-label="App"
            >
                {links.map(({ href, label, Icon }) => {
                    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-semibold leading-tight transition-colors",
                                active
                                    ? "bg-primary-soft text-primary-strong"
                                    : "text-muted hover:bg-surface-2 hover:text-foreground",
                            )}
                        >
                            <Icon size={18} aria-hidden="true" />
                            <span className="max-w-full truncate">{label}</span>
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
}
