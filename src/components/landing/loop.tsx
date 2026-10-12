"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { Check, Eye, Lightbulb, MessageSquareHeart, Route, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { useLanguage } from "@/lib/i18n/context";
import { useKnowledge } from "@/lib/knowledge-context";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./shared";

const EASE = [0.22, 1, 0.36, 1] as const;

function useSteps() {
    const { t } = useLanguage();
    return [
        { key: "observe", ...t.landing.loop.observe, Icon: Eye, accent: "#7fb6ec" },
        { key: "understand", ...t.landing.loop.understand, Icon: Lightbulb, accent: "#f4b06b" },
        { key: "act", ...t.landing.loop.act, Icon: Route, accent: "#7fd1c4" },
        { key: "reflect", ...t.landing.loop.reflect, Icon: MessageSquareHeart, accent: "#d5a6e6" },
    ];
}

/** Mock product screens rendered for each loop step. */
function StepVisual({ index, compact = false }: { index: number; compact?: boolean }) {
    const { t, locale } = useLanguage();
    const { categories, getIntervention } = useKnowledge();
    const cat = categories[1] ?? categories[0];
    const clar = cat?.clarifications.slice(0, 3) ?? [];
    const sample = getIntervention("graphic-organizer");
    const titleCls = cn("font-display font-semibold leading-snug", compact ? "text-lg" : "text-2xl");

    const header = (label: string) => (
        <div className={cn("flex items-center justify-between gap-2", compact ? "mb-3" : "mb-5")}>
            <p className="truncate text-[11px] font-semibold uppercase tracking-widest text-white/50 sm:text-xs">
                {label}
            </p>
            <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/70 sm:px-3 sm:text-xs">
                {t.landing.loopMock.class}
            </span>
        </div>
    );

    if (index === 0) {
        return (
            <div>
                {header(t.landing.loopMock.step1)}
                <p className={titleCls}>{t.landing.loopMock.step1Title}</p>
                <div className={cn("grid", compact ? "mt-4 gap-2" : "mt-6 gap-2.5")}>
                    {categories.map((c, i) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06, duration: 0.5, ease: EASE }}
                            className={`flex items-center gap-3 rounded-2xl border px-4 ${compact ? "py-2.5" : "py-3"} ${
                                i === 1 ? "border-[#7fd1c4] bg-[#7fd1c4]/15" : "border-white/10 bg-white/5"
                            }`}
                        >
                            <CategoryIcon icon={c.icon} size={18} />
                            <span className="flex-1 text-sm font-medium">{c.title}</span>
                            {i === 1 && <Check size={16} className="text-[#7fd1c4]" aria-hidden="true" />}
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }
    if (index === 1) {
        return (
            <div>
                {header(t.landing.loopMock.step2)}
                <p className={titleCls}>{t.landing.loopMock.step2Title}</p>
                <div className={cn(compact ? "mt-4 space-y-2" : "mt-6 space-y-2.5")}>
                    {clar.map((c, i) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.5, ease: EASE }}
                            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                                i === 0 ? "border-[#f4b06b] bg-[#f4b06b]/15" : "border-white/10 bg-white/5"
                            }`}
                        >
                            <span
                                className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${i === 0 ? "border-[#f4b06b] bg-[#f4b06b]" : "border-white/30"}`}
                            />
                            {c.label}
                        </motion.div>
                    ))}
                </div>
                {clar[0] && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 }}
                        className="mt-5 flex gap-3 rounded-2xl bg-white/5 p-4 text-sm text-white/75"
                    >
                        <Sparkles size={16} className="mt-0.5 shrink-0 text-[#f4b06b]" aria-hidden="true" />
                        <p className="line-clamp-3">{clar[0].insight}</p>
                    </motion.div>
                )}
            </div>
        );
    }
    if (index === 2) {
        return (
            <div>
                {header(t.landing.loopMock.step3)}
                <p className="text-xs font-semibold uppercase tracking-widest text-[#7fd1c4]">
                    {t.landing.loopMock.suggestedStrategy}
                </p>
                <p className={cn("mt-2", titleCls)}>{sample?.title}</p>
                <p className="mt-3 line-clamp-2 text-sm text-white/65">{sample?.why}</p>
                <ol className={cn(compact ? "mt-4 space-y-2.5" : "mt-6 space-y-3")}>
                    {sample?.steps.slice(0, compact ? 3 : 4).map((s, i) => (
                        <motion.li
                            key={s}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.5, ease: EASE }}
                            className="flex items-start gap-3 text-sm"
                        >
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#7fd1c4] text-xs font-bold text-[#0c2421]">
                                {i + 1}
                            </span>
                            <span className="text-white/85">{s}</span>
                        </motion.li>
                    ))}
                </ol>
            </div>
        );
    }
    const options = t.landing.loopMock.reflectOptions;
    return (
        <div>
            {header(t.landing.loopMock.step4)}
            <p className={titleCls}>{t.landing.loopMock.step4Title}</p>
            <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-1.5 sm:gap-2.5">
                {options.map((o, i) => (
                    <motion.div
                        key={o}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.07, duration: 0.4, ease: EASE }}
                        className={`rounded-2xl border px-1.5 sm:px-3 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold ${
                            i === 0 ? "border-[#d5a6e6] bg-[#d5a6e6]/20" : "border-white/10 bg-white/5 text-white/70"
                        }`}
                    >
                        {o}
                    </motion.div>
                ))}
            </div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-5 rounded-2xl bg-white/5 p-4 text-sm text-white/75"
            >
                {locale === "id"
                    ? "“Raka mulai menulis 3 kalimat utuh setelah memakai peta konsep.”"
                    : "“Raka wrote three full sentences after using the concept map.”"}
            </motion.div>
            <div className="mt-5 flex items-end gap-1.5" aria-hidden="true">
                {[30, 45, 40, 62, 70, 84].map((h, i) => (
                    <motion.span
                        key={h}
                        initial={{ height: 0 }}
                        animate={{ height: compact ? Math.round(h * 0.72) : h }}
                        transition={{ delay: 0.35 + i * 0.06, duration: 0.6, ease: EASE }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-[#d5a6e6]/30 to-[#d5a6e6]"
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Apple-style pinned storytelling: the section is 4 viewports tall, the panel
 * stays fixed and the active step advances with scroll progress.
 */
export function LandingLoop() {
    const { t } = useLanguage();
    const steps = useSteps();
    const ref = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const fill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
    const glowRotate = useTransform(scrollYProgress, [0, 1], [0, 220]);

    useMotionValueEvent(scrollYProgress, "change", (v) => {
        const next = Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length)));
        if (next !== active) setActive(next);
    });

    return (
        <section id="how" className="bg-ink relative text-white">
            <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden="true" />

            {/* Desktop — pinned scrollytelling */}
            <div ref={ref} className="relative hidden h-[420vh] lg:block">
                <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                    <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_1.05fr] items-center gap-16 px-5">
                        <div>
                            <Eyebrow dark>{t.landing.eyebrowLoop}</Eyebrow>
                            <h2 className="mt-5 text-5xl font-bold">{t.landing.loopTitle}</h2>
                            <p className="mt-4 max-w-md text-lg text-white/65">{t.landing.loopSub}</p>

                            <div className="relative mt-10 pl-8">
                                <div
                                    className="absolute bottom-2 left-[11px] top-2 w-0.5 rounded-full bg-white/10"
                                    aria-hidden="true"
                                />
                                <motion.div
                                    style={{ height: fill }}
                                    className="absolute left-[11px] top-2 w-0.5 rounded-full bg-gradient-to-b from-[#7fd1c4] to-accent"
                                    aria-hidden="true"
                                />
                                <ol className="space-y-6">
                                    {steps.map((s, i) => (
                                        <li key={s.key} className="relative">
                                            <span
                                                className={`absolute -left-8 top-1 grid h-6 w-6 place-items-center rounded-full border-2 transition-all duration-500 ${
                                                    i <= active ? "border-transparent" : "border-white/20 bg-[#0c2421]"
                                                }`}
                                                style={i <= active ? { background: s.accent } : undefined}
                                            >
                                                {i < active && (
                                                    <Check size={12} className="text-[#0c2421]" aria-hidden="true" />
                                                )}
                                            </span>
                                            <div
                                                className={`transition-all duration-500 ${i === active ? "opacity-100" : "opacity-40"}`}
                                            >
                                                <p className="font-display text-2xl font-semibold">{s.title}</p>
                                                <motion.p
                                                    initial={false}
                                                    animate={{
                                                        height: i === active ? "auto" : 0,
                                                        opacity: i === active ? 1 : 0,
                                                    }}
                                                    transition={{ duration: 0.45, ease: EASE }}
                                                    className="overflow-hidden text-white/70"
                                                >
                                                    <span className="block pt-1">{s.desc}</span>
                                                </motion.p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>

                        {/* Device panel */}
                        <div className="relative">
                            <motion.div
                                aria-hidden="true"
                                style={{ rotate: glowRotate }}
                                className="absolute -inset-10 rounded-full opacity-60 blur-3xl"
                            >
                                <div
                                    className="h-full w-full rounded-full transition-colors duration-700"
                                    style={{
                                        background: `conic-gradient(from 0deg, ${steps[active].accent}55, transparent 40%, ${steps[active].accent}33, transparent 80%)`,
                                    }}
                                />
                            </motion.div>
                            <div className="relative min-h-[520px] rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
                                <div className="mb-6 flex gap-1.5" aria-hidden="true">
                                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                                </div>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={active}
                                        initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
                                        transition={{ duration: 0.45, ease: EASE }}
                                    >
                                        <StepVisual index={active} />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                            <p className="mt-5 text-center font-display text-sm tracking-widest text-white/40">
                                0{active + 1} <span className="text-white/20">/ 0{steps.length}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile / tablet — pinned horizontal scrollytelling */}
            <LoopScrollytelling steps={steps} />
        </section>
    );
}

/**
 * Phones and tablets translate a measured horizontal track with vertical page
 * scroll. The card preview stays deliberately compact, including three action
 * steps, so the pinned scene fits comfortably on short mobile viewports.
 */
function LoopScrollytelling({ steps }: { steps: ReturnType<typeof useSteps> }) {
    const { t } = useLanguage();
    const ref = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [distance, setDistance] = useState(0);
    const [active, setActive] = useState(0);

    useEffect(() => {
        const measure = () => {
            const viewport = viewportRef.current;
            const track = trackRef.current;
            if (!viewport || !track) return;
            setDistance(Math.max(0, track.scrollWidth - viewport.clientWidth));
        };

        measure();
        const observer = new ResizeObserver(measure);
        if (viewportRef.current) observer.observe(viewportRef.current);
        if (trackRef.current) observer.observe(trackRef.current);
        window.addEventListener("resize", measure);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, []);

    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
    const fill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    useMotionValueEvent(scrollYProgress, "change", (value) => {
        const next = Math.min(steps.length - 1, Math.max(0, Math.floor(value * steps.length)));
        setActive((current) => (current === next ? current : next));
    });

    return (
        <div ref={ref} className="relative block lg:hidden" style={{ height: `${Math.max(260, steps.length * 68)}vh` }}>
            <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden py-5 sm:py-8">
                <div className="mx-auto w-full max-w-2xl px-4 sm:px-5">
                    <Eyebrow dark>{t.landing.eyebrowLoop}</Eyebrow>
                    <h2 className="mt-4 text-[1.75rem] font-bold leading-tight xs:text-3xl sm:mt-5 sm:text-4xl">
                        {t.landing.loopTitle}
                    </h2>
                    <p className="mt-3 text-[0.95rem] text-white/65 sm:mt-4 sm:text-lg">{t.landing.loopSub}</p>

                    <ol aria-label={t.landing.loopTitle} className="mt-6 grid grid-cols-4 gap-2 sm:mt-7">
                        {steps.map((step, index) => (
                            <li key={step.key} aria-current={index === active ? "step" : undefined}>
                                <span className="block h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                                    <span
                                        className="block h-full rounded-full transition-[width] duration-300"
                                        style={{ width: index <= active ? "100%" : "0%", background: step.accent }}
                                    />
                                </span>
                                <span
                                    className={cn(
                                        "mt-2 block font-display text-xs font-semibold transition-colors",
                                        index === active ? "text-white" : "text-white/45",
                                    )}
                                >
                                    <span aria-hidden="true">0{index + 1}</span>
                                    <span className="sr-only">{step.title}</span>
                                </span>
                            </li>
                        ))}
                    </ol>
                    <p className="sr-only" aria-live="polite">
                        {active + 1} / {steps.length}: {steps[active].title}
                    </p>
                </div>

                <section ref={viewportRef} aria-label={t.landing.loopTitle} className="mt-4 overflow-hidden sm:mt-5">
                    <motion.div
                        ref={trackRef}
                        style={{ x }}
                        className="flex w-max items-stretch gap-3 px-4 pr-4 sm:gap-4 sm:px-5 sm:pr-5"
                    >
                        {steps.map((step, index) => (
                            <article
                                key={step.key}
                                aria-hidden={index !== active}
                                aria-label={`${index + 1} / ${steps.length}: ${step.title}`}
                                className={cn(
                                    "flex h-[clamp(20rem,54svh,26rem)] w-[calc(100vw-2rem)] max-w-[38rem] shrink-0 flex-col rounded-[1.75rem] border bg-white/[0.06] p-4 transition-colors duration-300 sm:p-5",
                                    index === active ? "border-white/20" : "border-white/10",
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <span
                                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#0c2421]"
                                        style={{ background: step.accent }}
                                    >
                                        <step.Icon size={18} aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="line-clamp-2 font-display text-lg font-semibold leading-snug">
                                            {step.title}
                                        </p>
                                        <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-white/65">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0c2421]/70 p-3 shadow-inner sm:mt-4 sm:p-4">
                                    <div className="mb-3 flex gap-1.5" aria-hidden="true">
                                        <span className="h-2 w-2 rounded-full bg-white/15" />
                                        <span className="h-2 w-2 rounded-full bg-white/15" />
                                        <span className="h-2 w-2 rounded-full bg-white/15" />
                                    </div>
                                    <StepVisual index={index} compact />
                                </div>
                            </article>
                        ))}
                    </motion.div>
                </section>

                <div className="mx-auto mt-4 w-full max-w-2xl px-4 sm:mt-5 sm:px-5">
                    <div
                        role="progressbar"
                        aria-label={t.landing.loopTitle}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round((active / (steps.length - 1)) * 100)}
                        aria-valuetext={`${active + 1} / ${steps.length}: ${steps[active].title}`}
                        className="h-1 overflow-hidden rounded-full bg-white/10"
                    >
                        <motion.div
                            style={{ width: fill }}
                            className="h-full rounded-full bg-gradient-to-r from-[#7fb6ec] via-[#7fd1c4] to-[#d5a6e6]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
