"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { DEFAULT_KNOWLEDGE, type KnowledgeData, localizeKnowledge } from "@/lib/knowledge";

type Localized = ReturnType<typeof localizeKnowledge>;

interface KnowledgeContextType extends Localized {
    getCategory: (id: string) => Localized["categories"][number] | undefined;
    getClarification: (
        categoryId: string,
        clarificationId: string,
    ) => Localized["categories"][number]["clarifications"][number] | undefined;
    getIntervention: (slug: string) => Localized["interventions"][number] | undefined;
    refresh: () => Promise<void>;
}

const KnowledgeContext = createContext<KnowledgeContextType | null>(null);

/**
 * Serves the admin-managed knowledge base. Starts with built-in defaults (no loading flash),
 * then swaps in the database version once fetched.
 */
export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
    const { locale } = useLanguage();
    const [data, setData] = useState<KnowledgeData>(DEFAULT_KNOWLEDGE);

    const refresh = useCallback(async () => {
        try {
            const res = await fetch("/api/knowledge");
            if (res.ok) setData(await res.json());
        } catch {
            /* keep defaults */
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const value = useMemo<KnowledgeContextType>(() => {
        const l = localizeKnowledge(data, locale);
        return {
            ...l,
            getCategory: (id) => l.categories.find((c) => c.id === id),
            getClarification: (cat, id) =>
                l.categories.find((c) => c.id === cat)?.clarifications.find((c) => c.id === id),
            getIntervention: (slug) => l.interventions.find((i) => i.slug === slug),
            refresh,
        };
    }, [data, locale, refresh]);

    return <KnowledgeContext.Provider value={value}>{children}</KnowledgeContext.Provider>;
}

export function useKnowledge() {
    const ctx = useContext(KnowledgeContext);
    if (!ctx) throw new Error("useKnowledge must be used inside KnowledgeProvider");
    return ctx;
}
