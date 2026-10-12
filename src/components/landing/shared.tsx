"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

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

/**
 * Native, swipeable carousel state for phone layouts (scroll-snap, no scroll
 * hijacking). Slides are the track's children marked with `data-slide`.
 */
export function useSnapCarousel() {
    const ref = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let raf = 0;
        const measure = () => {
            raf = 0;
            const max = el.scrollWidth - el.clientWidth;
            setProgress(max > 0 ? Math.min(1, el.scrollLeft / max) : 0);
            const slides = el.querySelectorAll<HTMLElement>("[data-slide]");
            if (!slides.length) return;
            if (el.scrollLeft >= max - 2) {
                setActive(slides.length - 1);
                return;
            }
            const pad = Number.parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
            let best = 0;
            let bestDist = Number.POSITIVE_INFINITY;
            slides.forEach((s, i) => {
                const d = Math.abs(s.offsetLeft - pad - el.scrollLeft);
                if (d < bestDist) {
                    bestDist = d;
                    best = i;
                }
            });
            setActive(best);
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(measure);
        };
        measure();
        el.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            el.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    const scrollTo = useCallback((index: number) => {
        const el = ref.current;
        const slide = el?.querySelectorAll<HTMLElement>("[data-slide]")[index];
        if (!el || !slide) return;
        const pad = Number.parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollTo({
            left: Math.min(el.scrollWidth - el.clientWidth, slide.offsetLeft - pad),
            behavior: reduce ? "auto" : "smooth",
        });
    }, []);

    return { ref, active, progress, scrollTo };
}

/** Classes for a phone carousel track. Pair with a trailing <CarouselEndSpacer />. */
export const carouselTrackCls =
    // From sm the first card lines up with the centred max-w-2xl heading above it.
    "relative flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pl-4 scroll-pl-4 pb-2 no-scrollbar sm:gap-4 sm:pl-[max(1.25rem,calc((100%_-_42rem)/2_+_1.25rem))] sm:scroll-pl-[max(1.25rem,calc((100%_-_42rem)/2_+_1.25rem))]";

/** Flex overflow containers drop end padding in some browsers — this keeps the last card off the edge. */
export function CarouselEndSpacer() {
    return <span aria-hidden="true" className="block w-1 shrink-0" />;
}

/** Dots that mirror (and control) the active slide. */
export function CarouselDots({
    count,
    active,
    onSelect,
    dark = false,
    label,
}: {
    count: number;
    active: number;
    onSelect: (i: number) => void;
    dark?: boolean;
    label: (i: number) => string;
}) {
    return (
        <div className="flex items-center justify-center gap-1">
            {Array.from({ length: count }, (_, i) => (
                <button
                    // biome-ignore lint/suspicious/noArrayIndexKey: dots are positional
                    key={i}
                    type="button"
                    onClick={() => onSelect(i)}
                    aria-label={label(i)}
                    aria-current={i === active ? "true" : undefined}
                    className="grid h-8 min-w-6 cursor-pointer place-items-center"
                >
                    <span
                        className={cn(
                            "block h-1.5 rounded-full transition-all duration-300",
                            i === active
                                ? "w-6 bg-gradient-to-r from-primary to-accent"
                                : dark
                                  ? "w-1.5 bg-white/25"
                                  : "w-1.5 bg-line",
                        )}
                    />
                </button>
            ))}
        </div>
    );
}

/**
 * Phone-only floating CTA: appears once the hero CTA has scrolled away and
 * steps aside when the closing CTA section comes into view.
 */
export function LandingStickyCta() {
    const { t } = useLanguage();
    const [show, setShow] = useState(false);

    useEffect(() => {
        let raf = 0;
        const update = () => {
            raf = 0;
            const hero = document.getElementById("hero-cta");
            const closing = document.getElementById("cta");
            const heroGone = hero ? hero.getBoundingClientRect().bottom < 0 : window.scrollY > 600;
            const closingNear = closing ? closing.getBoundingClientRect().top < window.innerHeight : false;
            setShow(heroGone && !closingNear);
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <div
            aria-hidden={!show}
            className={cn(
                "fixed inset-x-3 bottom-nav-offset z-40 mx-auto max-w-md transition-all duration-300 lg:hidden",
                show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[calc(100%+1.5rem)] opacity-0",
            )}
        >
            <div className="rounded-full border border-line/70 bg-surface/90 p-1.5 shadow-lift backdrop-blur-md">
                <ButtonLink
                    href="/register"
                    tabIndex={show ? undefined : -1}
                    className="h-12 w-full justify-center text-[0.95rem]"
                >
                    {t.landing.ctaQuickCheck}
                    <ArrowRight size={18} aria-hidden="true" />
                </ButtonLink>
            </div>
        </div>
    );
}
