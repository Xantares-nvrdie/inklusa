import Link from "next/link";

export function Logo({ href = "/", className = "" }: { href?: string; className?: string }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center gap-2.5 font-display ${className}`}
            aria-label="INKLUSA home"
        >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white shadow-soft">
                <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                </svg>
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground">INKLUSA</span>
        </Link>
    );
}
