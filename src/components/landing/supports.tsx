"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, MoveRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { useLanguage } from "@/lib/i18n/context";
import { useKnowledge } from "@/lib/knowledge-context";
import { Eyebrow, PARALLAX_SPRING } from "./shared";

const CARD_TONES = [
    { bg: "from-[#dff1ed] to-[#f5fbf9]", icon: "bg-primary text-white", ring: "hover:ring-primary/30" },
    { bg: "from-[#fdeedb] to-[#fffaf3]", icon: "bg-accent text-[#3b2208]", ring: "hover:ring-accent/30" },
    { bg: "from-[#e3effa] to-[#f6fafe]", icon: "bg-sky text-white", ring: "hover:ring-sky/30" },
    { bg: "from-[#f3e6f7] to-[#fcf8fd]", icon: "bg-[#7a3f8f] text-white", ring: "hover:ring-[#7a3f8f]/30" },
    { bg: "from-[#e6f2df] to-[#f8fcf6]", icon: "bg-success text-white", ring: "hover:ring-success/30" },
];

/**
 * Horizontal parallax track: vertical scroll is translated into sideways
 * movement while the section is pinned. Card artwork drifts slower than the
 * cards themselves for an extra layer of depth.
 */
export function LandingSupports() {
    const { t, locale } = useLanguage();
    const { categories, interventions, getIntervention } = useKnowledge();
    const sample = getIntervention("graphic-organizer");
    const ref = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [distance, setDistance] = useState(0);

    useEffect(() => {
        const measure = () => {
            const el = trackRef.current;
            if (!el) return;
            setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (trackRef.current) ro.observe(trackRef.current);
        window.addEventListener("resize", measure);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, []);

    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const p = useSpring(scrollYProgress, PARALLAX_SPRING);
    const x = useTransform(p, [0, 1], [0, -distance]);
    const iconX = useTransform(p, [0, 1], [0, distance * 0.08]);
    const bar = useTransform(p, [0, 1], ["0%", "100%"]);

    return (
        <section id="supports" ref={ref} className="relative h-[320vh] bg-background">
            <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
                <motion.div
                    ref={trackRef}
                    style={{ x }}
                    className="flex w-max items-stretch gap-6 px-5 lg:px-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))]"
                >
                    {/* Intro panel */}
                    <div className="flex w-[min(30rem,82vw)] shrink-0 flex-col justify-center pr-6">
                        <Eyebrow>{t.landing.eyebrowSupports}</Eyebrow>
                        <h2 className="mt-5 text-4xl font-bold leading-[1.08] sm:text-5xl">
                            {t.landing.supportsTitle}
                        </h2>
                        <p className="mt-5 text-lg text-muted">{t.landing.supportsDesc}</p>
                        <p className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary">
                            <MoveRight size={16} aria-hidden="true" /> {t.landing.dragHint}
                        </p>
                    </div>

                    {categories.map((c, i) => {
                        const tone = CARD_TONES[i % CARD_TONES.length];
                        const count = interventions.filter((iv) => iv.category === c.id).length;
                        return (
                            <article
                                key={c.id}
                                className={`group relative flex h-[min(30rem,70vh)] w-[min(21rem,78vw)] shrink-0 flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br ${tone.bg} p-7 ring-1 ring-line transition-all duration-500 hover:-translate-y-2 hover:shadow-lift ${tone.ring} hover:ring-4`}
                            >
                                <motion.div
                                    style={{ x: iconX }}
                                    className="pointer-events-none absolute -right-10 -top-10 opacity-[0.07]"
                                    aria-hidden="true"
                                >
                                    <CategoryIcon icon={c.icon} size={220} />
                                </motion.div>
                                <span className="font-display text-sm font-semibold text-muted">0{i + 1}</span>
                                <span
                                    className={`mt-6 grid h-14 w-14 place-items-center rounded-2xl shadow-soft ${tone.icon}`}
                                >
                                    <CategoryIcon icon={c.icon} size={26} />
                                </span>
                                <h3 className="mt-6 text-2xl font-bold">{c.title}</h3>
                                <p className="mt-3 line-clamp-4 text-muted">{c.description}</p>
                                <div className="mt-auto flex items-center justify-between border-t border-foreground/10 pt-5">
                                    <span className="text-sm font-semibold">
                                        {count} {locale === "id" ? "strategi" : count === 1 ? "strategy" : "strategies"}
                                    </span>
                                    <span className="grid h-9 w-9 place-items-center rounded-full bg-surface text-foreground shadow-soft transition-transform duration-300 group-hover:translate-x-1">
                                        <ArrowRight size={16} aria-hidden="true" />
                                    </span>
                                </div>
                            </article>
                        );
                    })}

                    {sample && (
                        <article className="relative flex h-[min(30rem,70vh)] w-[min(26rem,85vw)] shrink-0 flex-col overflow-hidden rounded-[2rem] bg-primary-strong p-8 text-white shadow-lift">
                            <div
                                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/40 blur-3xl"
                                aria-hidden="true"
                            />
                            <p className="relative text-xs font-semibold uppercase tracking-widest text-white/60">
                                {t.landing.exampleStrategy}
                            </p>
                            <h3 className="relative mt-3 text-3xl font-bold">{sample.title}</h3>
                            <p className="relative mt-3 line-clamp-3 text-sm text-white/75">
                                <strong className="text-white">{t.landing.whyTryThis}</strong> {sample.why}
                            </p>
                            <ol className="relative mt-5 space-y-2.5">
                                {sample.steps.slice(0, 3).map((s, i) => (
                                    <li key={s} className="flex items-start gap-3 text-sm">
                                        <span className="font-display font-bold text-accent">0{i + 1}</span>
                                        <span className="line-clamp-2 text-white/90">{s}</span>
                                    </li>
                                ))}
                            </ol>
                            <p className="relative mt-auto rounded-2xl bg-white/10 px-4 py-3 text-sm">
                                <strong>{t.landing.whatToObserve}</strong>{" "}
                                <span className="text-white/80">{sample.observe}</span>
                            </p>
                        </article>
                    )}
                </motion.div>

                {/* Progress rail */}
                <div className="mx-auto mt-10 h-1 w-48 overflow-hidden rounded-full bg-line" aria-hidden="true">
                    <motion.div
                        style={{ width: bar }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    />
                </div>
            </div>
        </section>
    );
}
