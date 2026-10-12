import Image from "next/image";
import Link from "next/link";

export function Logo({ href = "/", className = "" }: { href?: string; className?: string }) {
    return (
        <Link
            href={href}
            className={`inline-flex min-w-0 shrink-0 items-center gap-2 font-display sm:gap-2.5 ${className}`}
            aria-label="INKLUSA home"
        >
            <Image
                src="/LOGO.png"
                alt="INKLUSA Logo"
                width={36}
                height={36}
                className="h-8 w-8 object-contain sm:h-9 sm:w-9"
            />
            <span className="text-lg font-bold tracking-tight text-foreground sm:text-xl">INKLUSA</span>
        </Link>
    );
}
