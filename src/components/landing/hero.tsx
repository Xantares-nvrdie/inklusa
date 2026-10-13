"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, Check, Sparkles, UserRoundCheck } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { ButtonLink } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { useMediaQuery } from "@/lib/use-media-query";
import { PARALLAX_SPRING } from "./shared";

/**
 * Multi-layer hero. Primary content is immediately visible so mobile visitors
 * can paint the LCP element without waiting for a JavaScript entrance effect.
 * The desktop keeps its scroll and pointer parallax for depth.
 */
export function LandingHero() {
    const { t } = useLanguage();
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion();
    // Phones stack copy above the art, so layered parallax (and touch-driven tilt)
    // only pushes chips over the header. Keep the depth effect for desktop.
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const k = reduce || !isDesktop ? 0 : 1;

    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const p = useSpring(scrollYProgress, PARALLAX_SPRING);

    const yBlobs = useTransform(p, [0, 1], [0, 260 * k]);
    const yGrid = useTransform(p, [0, 1], [0, 120 * k]);
    const yText = useTransform(p, [0, 1], [0, 200 * k]);
    const textOpacity = useTransform(p, [0, 0.65], [1, k ? 0 : 1]);
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
        if (e.pointerType !== "mouse") return;
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
            {/* Lighter mobile fields retain the colour treatment with less raster work. */}
            <motion.div style={{ y: yBlobs }} className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
                <div className="absolute -left-24 -top-24 h-[24rem] w-[24rem] rounded-full bg-primary/20 blur-[72px] sm:-left-32 sm:-top-32 sm:h-[30rem] sm:w-[30rem] sm:blur-[96px] lg:-left-40 lg:-top-40 lg:h-[36rem] lg:w-[36rem] lg:blur-[120px]" />
                <div className="absolute -right-20 top-8 h-[22rem] w-[22rem] rounded-full bg-accent/25 blur-[72px] sm:-right-24 sm:h-[26rem] sm:w-[26rem] sm:blur-[96px] lg:-right-32 lg:top-10 lg:h-[30rem] lg:w-[30rem] lg:blur-[120px]" />
                <div className="absolute bottom-0 left-1/3 h-[18rem] w-[18rem] rounded-full bg-sky/15 blur-[72px] sm:h-[21rem] sm:w-[21rem] sm:blur-[96px] lg:h-[24rem] lg:w-[24rem] lg:blur-[120px]" />
            </motion.div>
            <motion.div
                style={{ y: yGrid }}
                className="bg-grid pointer-events-none absolute inset-0 -z-10"
                aria-hidden="true"
            />

            <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-14 pt-7 sm:gap-10 sm:px-5 sm:pb-28 sm:pt-14 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.05fr_0.95fr]">
                {/* Copy is deliberately static on entry for a fast, stable LCP. */}
                <motion.div style={{ y: yText, opacity: textOpacity }} className="relative z-10 space-y-5 sm:space-y-8">
                    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3.5 py-1 text-xs font-medium text-primary-strong shadow-soft backdrop-blur sm:px-4 sm:py-1.5 sm:text-sm">
                        <span className="relative grid h-2 w-2 place-items-center">
                            <span className="animate-pulse-ring absolute h-2 w-2 rounded-full bg-primary" />
                            <span className="h-2 w-2 rounded-full bg-primary" />
                        </span>
                        {t.landing.taglineBadge}
                    </span>

                    <h1
                        id="hero-title"
                        className="text-[2.1rem] font-bold leading-[1.05] tracking-[-0.035em] min-[420px]:text-[2.5rem] sm:text-7xl sm:leading-[1.02] lg:text-[5.4rem]"
                    >
                        {titleLines.map((line, i) => (
                            <span key={line} className="block overflow-hidden pb-1 sm:pb-2">
                                <span className={`block ${i === 1 ? "text-gradient-warm" : ""}`}>{line}</span>
                            </span>
                        ))}
                    </h1>

                    <p className="max-w-xl text-[0.95rem] leading-relaxed text-muted sm:text-lg">
                        {t.landing.heroDescription}
                    </p>

                    <div
                        id="hero-cta"
                        className="flex flex-col items-stretch gap-1.5 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:pt-0"
                    >
                        <ButtonLink
                            href="/register"
                            size="lg"
                            className="group w-full justify-center sm:w-auto"
                            id="cta-hero-start"
                        >
                            {t.landing.ctaQuickCheck}
                            <ArrowRight
                                size={18}
                                aria-hidden="true"
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </ButtonLink>
                        {/* Secondary action reads as a quiet link on phones so the primary CTA leads. */}
                        <ButtonLink
                            href="#how"
                            variant="outline"
                            size="lg"
                            className="group w-full justify-center max-sm:h-12 max-sm:border-transparent max-sm:bg-transparent max-sm:text-[0.95rem] max-sm:text-primary-strong max-sm:shadow-none sm:w-auto"
                            id="cta-hero-how"
                        >
                            {t.landing.ctaHow}
                            <ArrowDown
                                size={16}
                                aria-hidden="true"
                                className="transition-transform group-hover:translate-y-0.5 sm:hidden"
                            />
                        </ButtonLink>
                    </div>

                    <p className="flex items-center justify-center gap-2 text-xs text-muted sm:justify-start sm:text-sm">
                        <Sparkles size={14} className="shrink-0 text-accent" aria-hidden="true" />
                        {t.landing.quote}
                    </p>
                </motion.div>

                {/* Illustration remains visual-rich, but no longer fades in after hydration. */}
                <div className="relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-[540px]">
                    <motion.div style={{ y: yArt, scale: artScale }} className="absolute inset-0">
                        <motion.div style={{ x: artX, y: artY }} className="relative h-full w-full">
                            <div
                                className="absolute inset-[12%] rounded-full bg-gradient-to-br from-primary-soft via-white to-accent-soft"
                                aria-hidden="true"
                            />
                            <div
                                className="absolute inset-[6%] rounded-full border border-dashed border-primary/25 lg:animate-spin-slow"
                                aria-hidden="true"
                            />
                            <Image
                                src="/landing/hero-clay.jpg"
                                alt={t.landing.heroImageAlt}
                                fill
                                preload
                                fetchPriority="high"
                                sizes="(min-width: 1024px) 540px, (min-width: 640px) 420px, 352px"
                                className="object-contain mix-blend-multiply"
                            />
                        </motion.div>
                    </motion.div>

                    {/* Chip A — observed barrier */}
                    <motion.div style={{ y: yChipA }} className="absolute left-0 top-[3%] z-20 sm:-left-10 sm:top-[6%]">
                        <motion.div
                            style={{ x: chipX, y: chipY }}
                            className="glass w-44 rounded-2xl border border-white/70 p-3.5 shadow-lift sm:w-56 sm:p-4"
                        >
                            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted">
                                {t.landing.observedBarrier}
                            </p>
                            <p className="mt-1 font-display text-base font-bold sm:text-lg">
                                {t.landing.sampleBarrierTitle}
                            </p>
                            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-2 sm:mt-3">
                                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-primary to-accent" />
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Chip B — teacher decides */}
                    <motion.div
                        style={{ y: yChipB }}
                        className="absolute bottom-0 left-[2%] z-20 sm:-bottom-2 sm:left-[4%]"
                    >
                        <motion.div
                            style={{ x: chipX, y: chipY }}
                            className="flex items-center gap-2.5 rounded-full border border-line bg-surface px-3.5 py-2 shadow-lift sm:gap-3 sm:px-4 sm:py-2.5"
                        >
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-soft text-[#9a5612] sm:h-8 sm:w-8">
                                <UserRoundCheck size={15} aria-hidden="true" />
                            </span>
                            <span className="text-xs font-semibold sm:text-sm">{t.landing.teacherDecides}</span>
                        </motion.div>
                    </motion.div>

                    {/* Chip C — strategy outcome */}
                    <motion.div
                        style={{ y: yChipC }}
                        className="absolute bottom-[20%] right-0 z-20 sm:-right-8 sm:bottom-[22%]"
                    >
                        <motion.div
                            style={{ x: chipX, y: chipY }}
                            className="rounded-2xl bg-primary-strong p-3.5 text-white shadow-lift sm:p-4"
                        >
                            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/60">
                                {t.landing.strategyTried}
                            </p>
                            <p className="mt-1 text-sm font-semibold sm:text-base">Graphic Organizer</p>
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
