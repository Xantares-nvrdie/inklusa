"use client";

import { CheckCircle2, CircleDashed, Clock3, MessageSquareText } from "lucide-react";
import { type PlanStatus, STATUS_LABELS_DATA } from "@/lib/knowledge";
import { useLanguage } from "@/lib/i18n/context";

const STYLE: Record<PlanStatus, { cls: string; Icon: typeof Clock3 }> = {
    PLANNED: { cls: "bg-sky-soft text-sky", Icon: CircleDashed },
    IN_PROGRESS: { cls: "bg-accent-soft text-[#9a5612]", Icon: Clock3 },
    NEEDS_REFLECTION: { cls: "bg-[#f3e6f7] text-[#7a3f8f]", Icon: MessageSquareText },
    COMPLETED: { cls: "bg-primary-soft text-primary-strong", Icon: CheckCircle2 },
};

/** Status is always conveyed by icon + label, never colour alone. */
export function StatusBadge({ status }: { status: PlanStatus }) {
    const { locale } = useLanguage();
    const { cls, Icon } = STYLE[status];
    const label = STATUS_LABELS_DATA[locale]?.[status] ?? status;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
            <Icon size={14} aria-hidden="true" />
            {label}
        </span>
    );
}
