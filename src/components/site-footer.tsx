"use client";

import { Logo } from "@/components/logo";
import { useLanguage } from "@/lib/i18n/context";

export function SiteFooter() {
    const { t } = useLanguage();

    return (
        <footer className="border-t border-line bg-surface">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <Logo />
                    <p className="max-w-sm text-sm text-muted">
                        {t.footer.disclaimer}
                    </p>
                </div>
                <div className="text-sm text-muted md:text-right">
                    <p>{t.footer.sdg}</p>
                    <p>© {new Date().getFullYear()} INKLUSA. {t.footer.rights}</p>
                </div>
            </div>
        </footer>
    );
}
