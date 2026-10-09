import Image from "next/image";
import Link from "next/link";

export function Logo({ href = "/", className = "" }: { href?: string; className?: string }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center gap-2.5 font-display ${className}`}
            aria-label="INKLUSA home"
        >
            <Image
                src="/LOGO.png"
                alt="INKLUSA Logo"
                width={36}
                height={36}
                className="object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-foreground">INKLUSA</span>
        </Link>
    );
}
