"use client";

import { Library, ListChecks, LogOut, Home, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

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
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
                <Logo href="/dashboard" />
                <nav className="flex items-center gap-1" aria-label="App">
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
                                    active ? "bg-primary-soft text-primary-strong" : "text-muted hover:text-foreground hover:bg-surface-2",
                                )}
                            >
                                <Icon size={16} aria-hidden="true" />
                                <span className="hidden sm:inline">{label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="flex items-center gap-3">
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
        </header>
    );
}
