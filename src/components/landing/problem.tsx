"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { BookOpenText, Ear, ListOrdered, Users } from "lucide-react";
import { useRef } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { useMediaQuery } from "@/lib/use-media-query";
import { Eyebrow, PARALLAX_SPRING } from "./shared";

const ICONS = [Ear, BookOpenText, ListOrdered, Users];
const TONES = [
    "bg-sky-soft text-sky",
    "bg-accent-soft text-[#9a5612]",
    "bg-primary-soft text-primary-strong",
    "bg-[#f3e6f7] text-[#7a3f8f]",
];

/** Sticky headline on the left, two card columns drifting at different speeds on the right. */
export function LandingProblem() {
    const { t } = useLanguage();
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion();
    // Columns stack on phones, so drifting them would make the cards overlap.
    const twoColumns = useMediaQuery("(min-width: 640px)");
    const k = reduce || !twoColumns ? 0 : 1;
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const p = useSpring(scrollYProgress, PARALLAX_SPRING);
    const yColA = useTransform(p, [0, 1], [60 * k, -60 * k]);
    const yColB = useTransform(p, [0, 1], [180 * k, -180 * k]);

    const cols = [
        [0, 2],
        [1, 3],
    ];

    return (
        <section id="problem" ref={ref} className="relative mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-28 lg:py-40">
            <div className="grid gap-8 sm:gap-14 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="lg:sticky lg:top-32 lg:self-start">
                    <Eyebrow>{t.landing.eyebrowProblem}</Eyebrow>
                    <h2 className="mt-4 sm:mt-5 text-2xl xs:text-3xl sm:text-5xl font-bold leading-[1.1]">
                        {t.landing.problemTitle}
                    </h2>
                    <blockquote className="mt-5 border-l-4 border-accent pl-4 font-display text-base italic text-muted sm:mt-8 sm:pl-5 sm:text-xl">
                        {t.landing.problemSub}
                    </blockquote>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 sm:gap-5">
                    {cols.map((col, ci) => (
                        // Columns dissolve on phones (`contents`) so cards read 01 → 04 in one list.
                        <motion.div
                            key={col.join()}
                            style={{ y: ci === 0 ? yColA : yColB }}
                            className={`contents sm:block sm:space-y-5 ${ci === 1 ? "sm:mt-24" : ""}`}
                        >
                            {col.map((idx) => {
                                const Icon = ICONS[idx];
                                return (
                                    <article
                                        key={idx}
                                        style={{ order: idx }}
                                        className="group relative flex items-start gap-4 overflow-hidden rounded-[1.5rem] border border-line bg-surface p-4 pr-12 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:block sm:rounded-[1.75rem] sm:p-7"
                                    >
                                        <span className="pointer-events-none absolute -right-1 -top-3 font-display text-[4.5rem] font-bold leading-none text-surface-2 transition-colors group-hover:text-primary-soft sm:-right-4 sm:-top-6 sm:text-[7rem]">
                                            0{idx + 1}
                                        </span>
                                        <span
                                            className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl sm:h-12 sm:w-12 ${TONES[idx]}`}
                                        >
                                            <Icon size={21} aria-hidden="true" />
                                        </span>
                                        <p className="relative pt-0.5 text-[0.95rem] font-medium leading-snug sm:mt-10 sm:pt-0 sm:text-lg">
                                            {t.landing.problems[idx]}
                                        </p>
                                    </article>
                                );
                            })}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
