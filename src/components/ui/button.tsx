import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type * as React from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer",
    {
        variants: {
            variant: {
                primary:
                    "bg-primary text-white shadow-soft hover:bg-primary-strong hover:shadow-lift hover:-translate-y-0.5",
                accent: "bg-accent text-[#3b2208] shadow-soft hover:brightness-105 hover:shadow-lift hover:-translate-y-0.5",
                soft: "bg-primary-soft text-primary-strong hover:bg-[#cfe9e4]",
                outline: "border border-line bg-surface text-foreground hover:border-primary hover:text-primary-strong",
                ghost: "text-muted hover:text-foreground hover:bg-surface-2",
            },
            size: {
                sm: "h-9 px-4 text-sm",
                md: "h-11 px-6 text-[0.95rem]",
                lg: "h-14 px-8 text-base",
            },
        },
        defaultVariants: { variant: "primary", size: "md" },
    },
);

type Props = VariantProps<typeof buttonVariants> & { className?: string };

export function Button({
    className,
    variant,
    size,
    ...props
}: Props & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function ButtonLink({
    className,
    variant,
    size,
    ...props
}: Props & React.ComponentProps<typeof Link>) {
    return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
