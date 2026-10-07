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
                "rounded-card border border-line bg-surface p-6 shadow-soft",
                interactive && "transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:border-primary/40",
                className,
            )}
            {...props}
        />
    );
}
