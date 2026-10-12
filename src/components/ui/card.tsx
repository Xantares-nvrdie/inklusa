import type * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
    className,
    interactive,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
    return (
        <div
            className={cn(
                // Arbitrary radius (not `rounded-card`) so tailwind-merge can override it per instance.
                "rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-soft",
                interactive &&
                    "transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:border-primary/40 active:scale-[0.99]",
                className,
            )}
            {...props}
        />
    );
}
