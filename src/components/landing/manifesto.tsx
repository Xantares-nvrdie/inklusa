"use client";

import { type MotionValue, motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { useMediaQuery } from "@/lib/use-media-query";

const HIGHLIGHT = new Set(["signal", "sinyal", "label", "care", "peduli", "differently", "sendiri"]);

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
    const opacity = useTransform(progress, range, [0.14, 1]);
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
 * Statement that "reads itself" — each word lights up as the user scrolls,
 * while an oversized outlined wordmark drifts horizontally behind.
 * Desktop pins it for 2.4 viewports; phones read it in normal flow so there
 * is no long empty scroll.
 */
export function LandingManifesto() {
    const pinned = useMediaQuery("(min-width: 1024px)");
    // Remount when the mode flips so the scroll hooks bind to the right target.
    return <ManifestoInner key={pinned ? "pinned" : "flow"} pinned={pinned} />;
}

function ManifestoInner({ pinned }: { pinned: boolean }) {
    const { t } = useLanguage();
    const sectionRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLParagraphElement>(null);
    const { scrollYProgress } = useScroll(
        pinned
            ? { target: sectionRef, offset: ["start start", "end end"] }
            : { target: textRef, offset: ["start 0.88", "end 0.5"] },
    );
    const words = t.landing.manifesto.split(" ");
    const xMark = useTransform(scrollYProgress, [0, 1], ["5%", "-45%"]);
    const xMark2 = useTransform(scrollYProgress, [0, 1], ["-40%", "0%"]);

    return (
        <section id="manifesto" ref={sectionRef} className="relative lg:h-[240vh]" aria-label="Manifesto">
            <div className="relative flex items-center overflow-hidden py-24 sm:py-32 lg:sticky lg:top-0 lg:h-svh lg:py-0">
                <motion.p
                    aria-hidden="true"
                    style={{ x: xMark }}
                    className="text-outline pointer-events-none absolute top-[6%] whitespace-nowrap font-display text-[26vw] font-bold leading-none lg:top-[12%] lg:text-[22vw]"
                >
                    INKLUSA · INKLUSA
                </motion.p>
                <motion.p
                    aria-hidden="true"
                    style={{ x: xMark2 }}
                    className="text-outline pointer-events-none absolute bottom-[4%] whitespace-nowrap font-display text-[16vw] font-bold leading-none lg:bottom-[8%] lg:text-[14vw]"
                >
                    OBSERVE · UNDERSTAND · ACT · REFLECT
                </motion.p>

                <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-5">
                    <p className="sr-only">{t.landing.manifesto}</p>
                    <p
                        ref={textRef}
                        aria-hidden="true"
                        className="font-display text-[1.7rem] font-semibold leading-[1.28] tracking-[-0.02em] xs:text-3xl sm:text-5xl sm:leading-[1.25] lg:text-[3.6rem]"
                    >
                        {words.map((w, i) => {
                            const start = (i / words.length) * 0.8 + 0.05;
                            const end = start + 0.8 / words.length + 0.04;
                            // biome-ignore lint/suspicious/noArrayIndexKey: words repeat; position is the identity
                            return <Word key={`${w}-${i}`} word={w} progress={scrollYProgress} range={[start, end]} />;
                        })}
                    </p>
                </div>
            </div>
        </section>
    );
}
