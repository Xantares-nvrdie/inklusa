"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
    const { locale, setLocale } = useLanguage();

    const option = (value: "id" | "en", label: string) => (
        <button
            type="button"
            onClick={() => setLocale(value)}
            className={cn(
                "inline-flex h-7 min-w-9 cursor-pointer items-center justify-center rounded-full px-2 text-[11px] font-bold transition-colors sm:px-2.5 sm:text-xs",
                locale === value
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted hover:bg-surface-2 hover:text-foreground",
            )}
            aria-pressed={locale === value}
        >
            {label}
        </button>
    );

    return (
        // biome-ignore lint/a11y/useSemanticElements: a toggle group, not a form fieldset
        <div
            role="group"
            className={cn(
                "inline-flex shrink-0 items-center gap-0.5 rounded-full border border-line bg-surface p-0.5 shadow-xs sm:gap-1 sm:p-1",
                className,
            )}
            aria-label="Pilih Bahasa / Language"
        >
            {/* The globe is decorative; drop it on phones to give the header room. */}
            <span className="hidden h-7 w-7 place-items-center text-muted sm:grid">
                <Globe size={15} aria-hidden="true" />
            </span>
            {option("id", "INA")}
            {option("en", "EN")}
        </div>
    );
}
