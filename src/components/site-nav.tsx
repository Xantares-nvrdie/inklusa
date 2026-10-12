"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";

export function SiteNav() {
    const { t } = useLanguage();

    return (
        <header className="sticky top-0 z-40 border-b border-line/70 glass pt-safe">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 sm:gap-4 px-4 sm:px-5">
                <Logo />
                <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex" aria-label="Primary">
                    <a href="#problem" className="hover:text-foreground">
                        {t.nav.problem}
                    </a>
                    <a href="#how" className="hover:text-foreground">
                        {t.nav.how}
                    </a>
                    <a href="#supports" className="hover:text-foreground">
                        {t.nav.supports}
                    </a>
                    <a href="#principles" className="hover:text-foreground">
                        {t.nav.principles}
                    </a>
                </nav>
                <div className="flex items-center gap-1.5 sm:gap-3">
                    <LanguageSwitcher />
                    <ButtonLink href="/login" size="sm" className="h-10 px-4 text-sm sm:h-9">
                        {t.nav.signIn}
                    </ButtonLink>
                    <ButtonLink
                        href="/register"
                        variant="outline"
                        size="sm"
                        className="hidden sm:inline-flex px-3 sm:px-4 text-xs sm:text-sm"
                    >
                        {t.nav.getStarted}
                    </ButtonLink>
                </div>
            </div>
        </header>
    );
}
