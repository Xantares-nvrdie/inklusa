"use client";

import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/lib/i18n/context";

export function SiteNav() {
    const { t } = useLanguage();

    return (
        <header className="sticky top-0 z-40 border-b border-line/70 glass">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
                <Logo />
                <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex" aria-label="Primary">
                    <a href="#problem" className="hover:text-foreground">{t.nav.problem}</a>
                    <a href="#how" className="hover:text-foreground">{t.nav.how}</a>
                    <a href="#supports" className="hover:text-foreground">{t.nav.supports}</a>
                    <a href="#principles" className="hover:text-foreground">{t.nav.principles}</a>
                </nav>
                <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                    <ButtonLink href="/login" variant="ghost" size="sm">{t.nav.signIn}</ButtonLink>
                    <ButtonLink href="/register" size="sm">{t.nav.getStarted}</ButtonLink>
                </div>
            </div>
        </header>
    );
}
