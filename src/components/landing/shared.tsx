"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Small uppercase label shown above section titles. */
export function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
    return (
        <span
            className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] ${
                dark ? "text-[#7fd1c4]" : "text-primary"
            }`}
        >
            <span className={`h-px w-8 ${dark ? "bg-[#7fd1c4]" : "bg-primary"}`} aria-hidden="true" />
            {children}
        </span>
    );
}

/** Thin gradient bar pinned to the top that tracks page scroll. */
export function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
    return (
        <motion.div
            aria-hidden="true"
            style={{ scaleX }}
            className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-primary via-[#3fae9f] to-accent"
        />
    );
}

/** Smooth spring config shared by all parallax layers. */
export const PARALLAX_SPRING = { stiffness: 110, damping: 28, mass: 0.4 } as const;
