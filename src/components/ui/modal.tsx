"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const SIZES = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-3xl",
} as const;

interface ModalProps {
    open: boolean;
    onClose: () => void;
    /** id of the element that names the dialog */
    labelledBy?: string;
    size?: keyof typeof SIZES;
    className?: string;
    children: React.ReactNode;
}

/**
 * Accessible dialog rendered in a portal (so it always sits above the sticky
 * header and tab bar). Phones get a bottom sheet with a grab handle and
 * safe-area padding; larger screens get a centred card.
 */
export function Modal({ open, onClose, labelledBy, size = "md", className, children }: ModalProps) {
    const [mounted, setMounted] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!open) return;
        const previousFocus = document.activeElement as HTMLElement | null;
        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";
        panelRef.current?.focus({ preventScroll: true });

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCloseRef.current();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = overflow;
            previousFocus?.focus?.({ preventScroll: true });
        };
    }, [open]);

    if (!open || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-5">
            <button
                type="button"
                tabIndex={-1}
                aria-label="Close"
                onClick={onClose}
                className="absolute inset-0 cursor-default bg-[#0c2421]/55 backdrop-blur-[3px] animate-fade-in"
            />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy}
                tabIndex={-1}
                className={cn(
                    "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[1.75rem] border border-line/80 bg-surface shadow-2xl outline-none animate-sheet-up",
                    "max-sm:border-b-0 max-sm:pb-safe sm:max-h-[88vh] sm:rounded-3xl sm:animate-pop-in",
                    SIZES[size],
                    className,
                )}
            >
                <span
                    className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line sm:hidden"
                    aria-hidden="true"
                />
                {children}
            </div>
        </div>,
        document.body,
    );
}

export function ModalHeader({
    children,
    onClose,
    closeLabel = "Close",
    className,
}: {
    children: React.ReactNode;
    onClose?: () => void;
    closeLabel?: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex items-start justify-between gap-3 border-b border-line/60 px-5 pb-4 pt-3 sm:px-6 sm:py-5",
                className,
            )}
        >
            <div className="min-w-0 flex-1">{children}</div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={closeLabel}
                    className="-mr-1.5 grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                    <X size={20} aria-hidden="true" />
                </button>
            )}
        </div>
    );
}

export function ModalBody({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6", className)}>{children}</div>
    );
}

export function ModalFooter({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("border-t border-line/60 bg-surface px-5 py-4 sm:px-6", className)}>{children}</div>;
}
