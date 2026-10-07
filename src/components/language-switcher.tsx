"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
    const { locale, setLocale } = useLanguage();

    return (
        <div className={`inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-xs ${className}`} aria-label="Pilih Bahasa / Language">
            <span className="grid h-7 w-7 place-items-center text-muted">
                <Globe size={15} aria-hidden="true" />
            </span>
            <button
                type="button"
                onClick={() => setLocale("id")}
                className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
                    locale === "id"
                        ? "bg-primary text-white shadow-xs"
                        : "text-muted hover:text-foreground hover:bg-surface-2"
                }`}
                aria-pressed={locale === "id"}
            >
                INA
            </button>
            <button
                type="button"
                onClick={() => setLocale("en")}
                className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
                    locale === "en"
                        ? "bg-primary text-white shadow-xs"
                        : "text-muted hover:text-foreground hover:bg-surface-2"
                }`}
                aria-pressed={locale === "en"}
            >
                EN
            </button>
        </div>
    );
}
