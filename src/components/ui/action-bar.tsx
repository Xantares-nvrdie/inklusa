import { cn } from "@/lib/utils";

/**
 * Keeps the primary action of a flow within thumb reach on phones: it floats
 * just above the tab bar while scrolling, then settles into the page flow.
 * From `md` up it is a plain wrapper, so desktop layout is unchanged.
 */
export function MobileActionBar({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                "sticky above-bottom-nav z-30 -mx-1 rounded-2xl border border-line/70 bg-surface/90 p-2 shadow-lift backdrop-blur-md transition-[bottom] duration-300",
                "md:static md:mx-0 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none",
                className,
            )}
        >
            {children}
        </div>
    );
}
