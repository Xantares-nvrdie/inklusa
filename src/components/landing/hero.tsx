"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Check, Sparkles, UserRoundCheck } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { ButtonLink } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { PARALLAX_SPRING } from "./shared";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Multi-layer hero. Each layer travels at its own speed while scrolling
 * (background slowest, floating chips fastest) to create depth, plus a
 * subtle pointer-driven tilt on the illustration.
 */
export function LandingHero() {
    const { t, locale } = useLanguage();
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion();
    const k = reduce ? 0 : 1;

    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const p = useSpring(scrollYProgress, PARALLAX_SPRING);

    const yBlobs = useTransform(p, [0, 1], [0, 260 * k]);
    const yGrid = useTransform(p, [0, 1], [0, 120 * k]);
    const yText = useTransform(p, [0, 1], [0, 200 * k]);
    const textOpacity = useTransform(p, [0, 0.65], [1, 0]);
    const yArt = useTransform(p, [0, 1], [0, -120 * k]);
    const artScale = useTransform(p, [0, 1], [1, 1 + 0.15 * k]);
    const yChipA = useTransform(p, [0, 1], [0, -340 * k]);
    const yChipB = useTransform(p, [0, 1], [0, -200 * k]);
    const yChipC = useTransform(p, [0, 1], [0, -460 * k]);
    const hintOpacity = useTransform(p, [0, 0.15], [1, 0]);

    // Pointer parallax (desktop)
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 60, damping: 18 });
    const sy = useSpring(my, { stiffness: 60, damping: 18 });
    const artX = useTransform(sx, (v) => v * 22 * k);
    const artY = useTransform(sy, (v) => v * 16 * k);
    const chipX = useTransform(sx, (v) => v * -34 * k);
    const chipY = useTransform(sy, (v) => v * -24 * k);

    function onPointerMove(e: React.PointerEvent<HTMLElement>) {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
    }

    const titleLines = [t.landing.heroTitle1, t.landing.heroTitleHighlight];

    return (
        <section
            ref={ref}
            onPointerMove={onPointerMove}
            className="relative isolate overflow-hidden"
            aria-labelledby="hero-title"
        >
            {/* Layer 0 — colour fields */}
            <motion.div style={{ y: yBlobs }} className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
                <div className="absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-primary/20 blur-[120px]" />
                <div className="absolute -right-32 top-10 h-[30rem] w-[30rem] rounded-full bg-accent/25 blur-[120px]" />
                <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-sky/15 blur-[120px]" />
            </motion.div>
            {/* Layer 1 — grid */}
            <motion.div
                style={{ y: yGrid }}
                className="bg-grid pointer-events-none absolute inset-0 -z-10"
                aria-hidden="true"
            />

            <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-10 px-5 pb-28 pt-14 lg:grid-cols-[1.05fr_0.95fr]">
                {/* Layer 2 — copy */}
                <motion.div style={{ y: yText, opacity: textOpacity }} className="relative z-10 space-y-8">
                    <motion.span
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EASE }}
                        className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-1.5 text-sm font-medium text-primary-strong shadow-soft backdrop-blur"
                    >
                        <span className="relative grid h-2 w-2 place-items-center">
                            <span className="animate-pulse-ring absolute h-2 w-2 rounded-full bg-primary" />
                            <span className="h-2 w-2 rounded-full bg-primary" />
                        </span>
                        {t.landing.taglineBadge}
                    </motion.span>

                    <h1
                        id="hero-title"
                        className="text-[2.9rem] font-bold leading-[1.02] tracking-[-0.035em] sm:text-7xl lg:text-[5.4rem]"
                    >
                        {titleLines.map((line, i) => (
                            <span key={line} className="block overflow-hidden pb-2">
                                <motion.span
                                    className={`block ${i === 1 ? "text-gradient-warm" : ""}`}
                                    initial={{ y: "110%" }}
                                    animate={{ y: 0 }}
                                    transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: EASE }}
                                >
                                    {line}
                                </motion.span>
                            </span>
                        ))}
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
                        className="max-w-xl text-lg leading-relaxed text-muted"
                    >
                        {t.landing.heroDescription}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
                        className="flex flex-wrap items-center gap-3"
                    >
                        <ButtonLink id="cta-hero-start" href="/register" size="lg" className="group">
                            {t.landing.ctaQuickCheck}
                            <ArrowRight
                                size={18}
                                aria-hidden="true"
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </ButtonLink>
                        <ButtonLink id="cta-hero-how" href="#how" variant="outline" size="lg">
                            {t.landing.ctaHow}
                        </ButtonLink>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex items-center gap-2 text-sm text-muted"
                    >
                        <Sparkles size={14} className="text-accent" aria-hidden="true" />
                        {t.landing.quote}
                    </motion.p>
                </motion.div>

                {/* Layer 3 — illustration + floating UI */}
                <div className="relative mx-auto aspect-square w-full max-w-[540px]">
                    <motion.div style={{ y: yArt, scale: artScale }} className="absolute inset-0">
                        <motion.div
                            style={{ x: artX, y: artY }}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
                            className="relative h-full w-full"
                        >
                            <div
                                className="absolute inset-[12%] rounded-full bg-gradient-to-br from-primary-soft via-white to-accent-soft"
                                aria-hidden="true"
                            />
                            <div
                                className="animate-spin-slow absolute inset-[6%] rounded-full border border-dashed border-primary/25"
                                aria-hidden="true"
                            />
                            <Image
                                src="/landing/hero-clay.jpg"
                                alt={t.landing.heroImageAlt}
                                fill
                                priority
                                sizes="(min-width: 1024px) 540px, 90vw"
                                className="object-contain mix-blend-multiply"
                            />
                        </motion.div>
                    </motion.div>

                    {/* Chip A — observed barrier */}
                    <motion.div style={{ y: yChipA }} className="absolute -left-2 top-[6%] z-20 sm:-left-10">
                        <motion.div
                            style={{ x: chipX, y: chipY }}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
                            className="glass w-56 rounded-2xl border border-white/70 p-4 shadow-lift"
                        >
                            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted">
                                {t.landing.observedBarrier}
                            </p>
                            <p className="mt-1 font-display text-lg font-bold">{t.landing.sampleBarrierTitle}</p>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                                    initial={{ width: 0 }}
                                    animate={{ width: "72%" }}
                                    transition={{ duration: 1.4, delay: 1.1, ease: EASE }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Chip B — teacher decides */}
                    <motion.div style={{ y: yChipB }} className="absolute -bottom-2 left-[4%] z-20">
                        <motion.div
                            style={{ x: chipX, y: chipY }}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.85, ease: EASE }}
                            className="flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-2.5 shadow-lift"
                        >
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-[#9a5612]">
                                <UserRoundCheck size={16} aria-hidden="true" />
                            </span>
                            <span className="text-sm font-semibold">{t.landing.teacherDecides}</span>
                        </motion.div>
                    </motion.div>

                    {/* Chip C — strategy outcome */}
                    <motion.div style={{ y: yChipC }} className="absolute -right-2 bottom-[22%] z-20 sm:-right-8">
                        <motion.div
                            style={{ x: chipX, y: chipY }}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 1, ease: EASE }}
                            className="rounded-2xl bg-primary-strong p-4 text-white shadow-lift"
                        >
                            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/60">
                                {t.landing.strategyTried}
                            </p>
                            <p className="mt-1 font-semibold">Graphic Organizer</p>
                            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
                                <Check size={12} aria-hidden="true" /> {t.landing.helped}
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll hint */}
            <motion.a
                href="#manifesto"
                style={{ opacity: hintOpacity }}
                className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted md:flex"
            >
                <span className="flex h-9 w-6 justify-center rounded-full border-2 border-muted/40 pt-1.5">
                    <span className="animate-scroll-dot h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                {t.landing.scrollHint}
            </motion.a>
        </section>
    );
}
