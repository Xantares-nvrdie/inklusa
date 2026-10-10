"use client";

import { type MotionValue, motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/lib/i18n/context";

const HIGHLIGHT = new Set(["signal", "sinyal", "label", "care", "peduli", "differently", "sendiri"]);

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
    const opacity = useTransform(progress, range, [0.12, 1]);
    const y = useTransform(progress, range, [10, 0]);
    const clean = word.toLowerCase().replace(/[^\p{L}]/gu, "");
    return (
        <motion.span
            style={{ opacity, y }}
            className={`mr-[0.28em] inline-block ${HIGHLIGHT.has(clean) ? "text-gradient-warm" : ""}`}
        >
            {word}
        </motion.span>
    );
}

/**
 * Pinned statement that "reads itself" — each word lights up as the user
 * scrolls, while an oversized outlined wordmark drifts horizontally behind.
 */
export function LandingManifesto() {
    const { t } = useLanguage();
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const words = t.landing.manifesto.split(" ");
    const xMark = useTransform(scrollYProgress, [0, 1], ["5%", "-45%"]);
    const xMark2 = useTransform(scrollYProgress, [0, 1], ["-40%", "0%"]);

    return (
        <section id="manifesto" ref={ref} className="relative h-[240vh]" aria-label="Manifesto">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <motion.p
                    aria-hidden="true"
                    style={{ x: xMark }}
                    className="text-outline pointer-events-none absolute top-[12%] whitespace-nowrap font-display text-[22vw] font-bold leading-none"
                >
                    INKLUSA · INKLUSA
                </motion.p>
                <motion.p
                    aria-hidden="true"
                    style={{ x: xMark2 }}
                    className="text-outline pointer-events-none absolute bottom-[8%] whitespace-nowrap font-display text-[14vw] font-bold leading-none"
                >
                    OBSERVE · UNDERSTAND · ACT · REFLECT
                </motion.p>

                <div className="relative mx-auto max-w-5xl px-5">
                    <p className="sr-only">{t.landing.manifesto}</p>
                    <p
                        aria-hidden="true"
                        className="font-display text-3xl font-semibold leading-[1.25] tracking-[-0.02em] sm:text-5xl lg:text-[3.6rem]"
                    >
                        {words.map((w, i) => {
                            const start = (i / words.length) * 0.8 + 0.05;
                            const end = start + 0.8 / words.length + 0.04;
                            return <Word key={`${w}-${i}`} word={w} progress={scrollYProgress} range={[start, end]} />;
                        })}
                    </p>
                </div>
            </div>
        </section>
    );
}
