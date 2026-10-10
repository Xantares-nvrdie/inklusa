"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { type Locale, type TranslationDict, translations } from "./translations";

interface LanguageContextType {
    locale: Locale;
    setLocale: (l: Locale) => void;
    t: TranslationDict;
}

const LanguageContext = createContext<LanguageContextType>({
    locale: "id",
    setLocale: () => {},
    t: translations.id,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("id");

    useEffect(() => {
        const saved = localStorage.getItem("inklusa_lang") as Locale | null;
        if (saved === "en" || saved === "id") {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (l: Locale) => {
        setLocaleState(l);
        localStorage.setItem("inklusa_lang", l);
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
