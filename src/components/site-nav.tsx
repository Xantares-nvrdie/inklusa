"use client";

import { ArrowRight, BookOpenCheck, Compass, Menu, Route, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { useLanguage } from "@/lib/i18n/context";

export function SiteNav() {
    const { t } = useLanguage();
    const [menuOpen, setMenuOpen] = useState(false);

    const links = [
        { id: "problem", label: t.nav.problem, Icon: Compass },
        { id: "how", label: t.nav.how, Icon: Route },
        { id: "supports", label: t.nav.supports, Icon: BookOpenCheck },
        { id: "principles", label: t.nav.principles, Icon: ShieldCheck },
    ];

    // Close the sheet first (it locks body scroll), then glide to the section.
    function goTo(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
        e.preventDefault();
        setMenuOpen(false);
        requestAnimationFrame(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            history.replaceState(null, "", `#${id}`);
        });
    }

    return (
        <header className="sticky top-0 z-40 border-b border-line/70 glass pt-safe">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-4 sm:px-5">
                <Logo />
                <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex" aria-label="Primary">
                    {links.map((l) => (
                        <a key={l.id} href={`#${l.id}`} className="hover:text-foreground">
                            {l.label}
                        </a>
                    ))}
                </nav>
                <div className="flex items-center gap-1.5 sm:gap-3">
                    {/* Phones keep the header to two actions; language lives in the menu there. */}
                    <LanguageSwitcher className="hidden sm:inline-flex" />
                    <ButtonLink href="/login" size="sm" className="h-10 px-4 text-sm sm:h-9">
                        {t.nav.signIn}
                    </ButtonLink>
                    <ButtonLink
                        href="/register"
                        variant="outline"
                        size="sm"
                        className="hidden px-3 text-xs sm:inline-flex sm:px-4 sm:text-sm"
                    >
                        {t.nav.getStarted}
                    </ButtonLink>
                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        aria-label={t.nav.menu}
                        aria-haspopup="dialog"
                        aria-expanded={menuOpen}
                        className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-line bg-surface text-foreground shadow-xs transition-colors hover:border-primary/40 md:hidden"
                    >
                        <Menu size={19} aria-hidden="true" />
                    </button>
                </div>
            </div>

            <Modal open={menuOpen} onClose={() => setMenuOpen(false)} labelledBy="site-menu-title" size="sm">
                <ModalHeader onClose={() => setMenuOpen(false)} closeLabel={t.nav.closeMenu}>
                    <p id="site-menu-title" className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                        {t.nav.explore}
                    </p>
                </ModalHeader>
                <ModalBody className="space-y-5 pt-3">
                    <nav aria-label="Primary">
                        <ul className="divide-y divide-line/60">
                            {links.map(({ id, label, Icon }, i) => (
                                <li key={id}>
                                    <a
                                        href={`#${id}`}
                                        onClick={(e) => goTo(e, id)}
                                        className="group flex min-h-14 items-center gap-3.5 py-2 text-base font-semibold"
                                    >
                                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-strong">
                                            <Icon size={18} aria-hidden="true" />
                                        </span>
                                        <span className="flex-1">{label}</span>
                                        <span className="font-display text-xs font-semibold text-muted">0{i + 1}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2/70 px-4 py-3">
                        <span className="text-sm font-medium text-muted">Bahasa / Language</span>
                        <LanguageSwitcher />
                    </div>
                </ModalBody>
                <ModalFooter className="grid grid-cols-2 gap-2.5">
                    <ButtonLink href="/login" variant="outline" className="h-12">
                        {t.nav.signIn}
                    </ButtonLink>
                    <ButtonLink href="/register" className="h-12">
                        {t.nav.getStarted}
                        <ArrowRight size={16} aria-hidden="true" />
                    </ButtonLink>
                </ModalFooter>
            </Modal>
        </header>
    );
}
