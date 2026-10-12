"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
    href: string;
    label: string;
    /** Optional compact label for narrow tab cells (full label stays the accessible name). */
    shortLabel?: string;
    Icon: LucideIcon;
    active: boolean;
}

const TEXT_INPUT_TYPES = new Set(["text", "search", "email", "password", "number", "tel", "url", "date", ""]);

function isTextField(el: EventTarget | null) {
    if (!(el instanceof HTMLElement)) return false;
    if (el.isContentEditable || el.tagName === "TEXTAREA") return true;
    return el instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(el.type);
}

/**
 * Flags `<html data-soft-keyboard="open">` while a text field has focus so the
 * tab bar (and anything pinned above it) can step aside for the keyboard.
 */
function useSoftKeyboardFlag() {
    useEffect(() => {
        const root = document.documentElement;
        const onIn = (e: FocusEvent) => {
            if (isTextField(e.target)) root.dataset.softKeyboard = "open";
        };
        const onOut = (e: FocusEvent) => {
            if (!isTextField(e.relatedTarget)) delete root.dataset.softKeyboard;
        };
        document.addEventListener("focusin", onIn);
        document.addEventListener("focusout", onOut);
        return () => {
            document.removeEventListener("focusin", onIn);
            document.removeEventListener("focusout", onOut);
            delete root.dataset.softKeyboard;
        };
    }, []);
}

/** Floating bottom tab bar for phones and small tablets (hidden from `md`). */
export function MobileTabBar({ items, label }: { items: TabItem[]; label: string }) {
    useSoftKeyboardFlag();

    return (
        <nav
            aria-label={label}
            className="mobile-tab-bar fixed inset-x-3 bottom-nav-offset z-50 mx-auto max-w-md rounded-[1.35rem] border border-line/70 bg-surface/95 p-1.5 shadow-lift backdrop-blur-md transition-[transform,opacity] duration-300 md:hidden"
        >
            <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
                {items.map(({ href, label: itemLabel, shortLabel, Icon, active }) => (
                    <li key={href} className="min-w-0">
                        <Link
                            href={href}
                            aria-current={active ? "page" : undefined}
                            aria-label={shortLabel ? itemLabel : undefined}
                            className={cn(
                                "relative flex min-h-13 flex-col items-center justify-center gap-1 rounded-2xl font-semibold leading-none transition-colors",
                                items.length > 4 ? "px-0.5 text-[10px]" : "px-1 text-[10.5px]",
                                active
                                    ? "bg-primary-soft text-primary-strong"
                                    : "text-muted active:bg-surface-2 active:text-foreground",
                            )}
                        >
                            <Icon size={20} strokeWidth={active ? 2.4 : 1.9} aria-hidden="true" />
                            <span className="block max-w-full truncate">{shortLabel ?? itemLabel}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
