"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { BookOpenText, Ear, ListOrdered, Users } from "lucide-react";
import { useRef } from "react";
import { useLanguage } from "@/lib/i18n/context";
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
    const k = reduce ? 0 : 1;
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const p = useSpring(scrollYProgress, PARALLAX_SPRING);
    const yColA = useTransform(p, [0, 1], [60 * k, -60 * k]);
    const yColB = useTransform(p, [0, 1], [180 * k, -180 * k]);

    const cols = [
        [0, 2],
        [1, 3],
    ];

    return (
        <section id="problem" ref={ref} className="relative mx-auto max-w-6xl px-5 py-28 lg:py-40">
            <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="lg:sticky lg:top-32 lg:self-start">
                    <Eyebrow>{t.landing.eyebrowProblem}</Eyebrow>
                    <h2 className="mt-5 text-4xl font-bold leading-[1.08] sm:text-5xl">{t.landing.problemTitle}</h2>
                    <blockquote className="mt-8 border-l-4 border-accent pl-5 font-display text-xl italic text-muted">
                        {t.landing.problemSub}
                    </blockquote>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    {cols.map((col, ci) => (
                        <motion.div
                            key={col.join()}
                            style={{ y: ci === 0 ? yColA : yColB }}
                            className={`space-y-5 ${ci === 1 ? "sm:mt-24" : ""}`}
                        >
                            {col.map((idx) => {
                                const Icon = ICONS[idx];
                                return (
                                    <article
                                        key={idx}
                                        className="group relative overflow-hidden rounded-[1.75rem] border border-line bg-surface p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                                    >
                                        <span className="pointer-events-none absolute -right-4 -top-6 font-display text-[7rem] font-bold leading-none text-surface-2 transition-colors group-hover:text-primary-soft">
                                            0{idx + 1}
                                        </span>
                                        <span
                                            className={`relative grid h-12 w-12 place-items-center rounded-2xl ${TONES[idx]}`}
                                        >
                                            <Icon size={22} aria-hidden="true" />
                                        </span>
                                        <p className="relative mt-10 text-lg font-medium leading-snug">
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
