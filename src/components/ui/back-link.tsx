import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Back navigation with a 44px touch target. Strips a leading "←" from translated labels. */
export function BackLink({ href, label, className }: { href: string; label: string; className?: string }) {
    return (
        <Link
            href={href}
            className={cn(
                "-my-2 -ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-full px-1 text-sm font-medium text-muted transition-colors hover:text-foreground",
                className,
            )}
        >
            <ArrowLeft size={16} aria-hidden="true" className="shrink-0" />
            <span>{label.replace(/^←\s*/, "")}</span>
        </Link>
    );
}
