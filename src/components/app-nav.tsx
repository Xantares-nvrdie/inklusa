"use client";

import { Home, Library, ListChecks, LogOut, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { signOut } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function AppNav({ name, image }: { name: string; image?: string | null }) {
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
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-5">
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
                                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                                    active
                                        ? "bg-primary-soft text-primary-strong"
                                        : "text-muted hover:text-foreground hover:bg-surface-2",
                                )}
                            >
                                <Icon size={16} aria-hidden="true" />
                                <span className="hidden sm:inline whitespace-nowrap">{label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="flex items-center gap-2 sm:gap-3">
                    <LanguageSwitcher />

                    {/* Profile avatar link */}
                    <Link
                        href="/profile"
                        title={name || "Profil"}
                        aria-label="Profil Pengguna"
                        className={cn(
                            "flex items-center gap-2 rounded-full p-1 sm:px-2.5 sm:py-1 transition-all border shrink-0",
                            pathname === "/profile"
                                ? "bg-primary-soft text-primary-strong border-primary/30 shadow-xs"
                                : "border-line/70 hover:border-primary/40 hover:bg-surface-2 text-foreground",
                        )}
                    >
                        <span className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden bg-primary-soft text-primary-strong flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                            {image ? (
                                <Image
                                    src={image}
                                    alt={name || "User"}
                                    width={32}
                                    height={32}
                                    className="h-full w-full object-cover"
                                    unoptimized
                                />
                            ) : (
                                <span>{(name || "U")[0]?.toUpperCase()}</span>
                            )}
                        </span>
                        <span className="hidden text-xs sm:text-sm font-semibold max-w-28 truncate md:inline">
                            {name}
                        </span>
                    </Link>

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
                className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 grid grid-cols-4 rounded-2xl border border-line/70 bg-surface/95 p-1.5 shadow-lift backdrop-blur md:hidden"
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
                                "flex min-h-13 sm:min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] sm:text-[11px] font-semibold leading-tight transition-colors",
                                active
                                    ? "bg-primary-soft text-primary-strong"
                                    : "text-muted hover:bg-surface-2 hover:text-foreground",
                            )}
                        >
                            <Icon size={17} aria-hidden="true" />
                            <span className="max-w-full truncate whitespace-nowrap">{label}</span>
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
}
