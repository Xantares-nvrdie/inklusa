"use client";

import { Home, Library, ListChecks, LogOut, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { MobileTabBar } from "@/components/mobile-tab-bar";
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
    ].map((l) => ({
        ...l,
        active: pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href)),
    }));

    return (
        <>
            <header className="sticky top-0 z-40 border-b border-line/70 glass pt-safe">
                <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-5">
                    <Logo href="/dashboard" />
                    <nav className="hidden items-center gap-1 md:flex" aria-label="App">
                        {links.map(({ href, label, Icon, active }) => (
                            <Link
                                key={href}
                                href={href}
                                id={`nav-${label.toLowerCase().replace(/\s/g, "-")}`}
                                aria-current={active ? "page" : undefined}
                                title={label}
                                className={cn(
                                    "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors lg:px-4",
                                    active
                                        ? "bg-primary-soft text-primary-strong"
                                        : "text-muted hover:bg-surface-2 hover:text-foreground",
                                )}
                            >
                                <Icon size={16} aria-hidden="true" />
                                {/* Tablet widths can't fit four labelled links — icons only until lg. */}
                                <span className="hidden whitespace-nowrap lg:inline">{label}</span>
                                <span className="sr-only lg:hidden">{label}</span>
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <LanguageSwitcher />

                        <Link
                            href="/profile"
                            title={name || "Profil"}
                            aria-label="Profil Pengguna"
                            aria-current={pathname === "/profile" ? "page" : undefined}
                            className={cn(
                                "flex shrink-0 items-center gap-2 rounded-full border p-0.5 transition-all sm:p-1 xl:px-2.5 xl:py-1",
                                pathname === "/profile"
                                    ? "border-primary/30 bg-primary-soft text-primary-strong shadow-xs"
                                    : "border-line/70 text-foreground hover:border-primary/40 hover:bg-surface-2",
                            )}
                        >
                            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary-soft text-xs font-bold text-primary-strong">
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
                            <span className="hidden max-w-28 truncate text-sm font-semibold xl:inline">{name}</span>
                        </Link>

                        {/* On phones sign-out lives on the profile page to keep the header uncluttered. */}
                        <button
                            id="btn-sign-out"
                            type="button"
                            onClick={async () => {
                                await signOut();
                                router.push("/");
                                router.refresh();
                            }}
                            className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground md:inline-flex"
                            aria-label={t.nav.signOut}
                            title={t.nav.signOut}
                        >
                            <LogOut size={18} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </header>
            <MobileTabBar items={links} label="App" />
        </>
    );
}
