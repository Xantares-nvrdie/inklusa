"use client";

import { BarChart3, BookMarked, GraduationCap, LayoutDashboard, LogOut, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { signOut } from "@/lib/auth-client";
import { adminDict } from "@/lib/i18n/admin";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function AdminNav({ name, image }: { name: string; image?: string | null }) {
    const pathname = usePathname();
    const router = useRouter();
    const { locale } = useLanguage();
    const a = adminDict[locale];

    const links = [
        { href: "/admin", label: a.nav.overview, Icon: LayoutDashboard },
        { href: "/admin/teachers", label: a.nav.teachers, Icon: Users },
        { href: "/admin/classes", label: a.nav.classes, Icon: GraduationCap },
        { href: "/admin/evaluations", label: a.nav.evaluations, Icon: BarChart3 },
        { href: "/admin/knowledge", label: a.nav.knowledge, shortLabel: a.nav.knowledgeShort, Icon: BookMarked },
    ].map((l) => ({
        ...l,
        active: l.href === "/admin" ? pathname === l.href : pathname.startsWith(l.href),
    }));

    return (
        <>
            <header className="sticky top-0 z-40 border-b border-line/70 glass pt-safe">
                <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-5">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <Logo href="/admin" />
                    </div>
                    <nav className="hidden items-center gap-0.5 md:flex lg:gap-1" aria-label="Admin">
                        {links.map(({ href, label, Icon, active }) => (
                            <Link
                                key={href}
                                href={href}
                                id={`admin-nav-${href.split("/").pop() || "overview"}`}
                                aria-current={active ? "page" : undefined}
                                title={label}
                                className={cn(
                                    "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors lg:px-3.5",
                                    active
                                        ? "bg-primary-soft text-primary-strong"
                                        : "text-muted hover:bg-surface-2 hover:text-foreground",
                                )}
                            >
                                <Icon size={16} aria-hidden="true" />
                                {/* 5 links don't fit with labels between md and lg — show icons there. */}
                                <span className="hidden whitespace-nowrap lg:inline">{label}</span>
                                <span className="sr-only lg:hidden">{label}</span>
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <LanguageSwitcher />
                        <Link
                            href="/admin/profile"
                            title={name || "Profil Admin"}
                            aria-label="Profil Admin"
                            aria-current={pathname === "/admin/profile" ? "page" : undefined}
                            className={cn(
                                "flex shrink-0 items-center gap-2 rounded-full border p-0.5 transition-all sm:p-1 xl:px-2.5 xl:py-1",
                                pathname === "/admin/profile"
                                    ? "border-primary/30 bg-primary-soft text-primary-strong shadow-xs"
                                    : "border-line/70 text-foreground hover:border-primary/40 hover:bg-surface-2",
                            )}
                        >
                            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary-soft text-xs font-bold text-primary-strong">
                                {image ? (
                                    <Image
                                        src={image}
                                        alt={name || "Admin"}
                                        width={32}
                                        height={32}
                                        className="h-full w-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <span>{(name || "A")[0]?.toUpperCase()}</span>
                                )}
                            </span>
                            <span className="hidden max-w-28 truncate text-sm font-semibold xl:inline">{name}</span>
                        </Link>
                        <button
                            id="admin-sign-out"
                            type="button"
                            onClick={async () => {
                                await signOut();
                                router.push("/");
                                router.refresh();
                            }}
                            className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground md:inline-flex"
                            aria-label="Sign out"
                            title="Sign out"
                        >
                            <LogOut size={18} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </header>
            <MobileTabBar items={links} label="Admin" />
        </>
    );
}
