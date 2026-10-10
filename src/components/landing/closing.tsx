"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Check, ShieldCheck, UserRoundCheck } from "lucide-react";
import { useRef } from "react";
import { ButtonLink } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { Eyebrow, PARALLAX_SPRING } from "./shared";

/** Three principle cards, each sitting on a different depth plane. */
export function LandingPrinciples() {
    const { t } = useLanguage();
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion();
    const k = reduce ? 0 : 1;
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const p = useSpring(scrollYProgress, PARALLAX_SPRING);
    const ys = [
        useTransform(p, [0, 1], [80 * k, -80 * k]),
        useTransform(p, [0, 1], [180 * k, -140 * k]),
        useTransform(p, [0, 1], [40 * k, -40 * k]),
    ];
    const yTitle = useTransform(p, [0, 1], [60 * k, -30 * k]);

    const items = [
        { title: t.landing.promises.p1Title, desc: t.landing.promises.p1Desc, Icon: ShieldCheck },
        { title: t.landing.promises.p2Title, desc: t.landing.promises.p2Desc, Icon: UserRoundCheck },
        { title: t.landing.promises.p3Title, desc: t.landing.promises.p3Desc, Icon: Check },
    ];

    return (
        <section id="principles" ref={ref} className="relative overflow-hidden bg-surface-2/70 py-32 lg:py-44">
            <div
                className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
                aria-hidden="true"
            />
            <div className="relative mx-auto max-w-6xl px-5">
                <motion.div style={{ y: yTitle }} className="mx-auto max-w-2xl text-center">
                    <Eyebrow>{t.landing.eyebrowPrinciples}</Eyebrow>
                    <h2 className="mt-5 text-4xl font-bold sm:text-5xl">{t.landing.promisesTitle}</h2>
                </motion.div>
                <div className="mt-16 grid gap-6 md:grid-cols-3">
                    {items.map(({ title, desc, Icon }, i) => (
                        <motion.article
                            key={title}
                            style={{ y: ys[i] }}
                            className="group relative overflow-hidden rounded-[2rem] border border-line bg-surface p-8 shadow-soft transition-shadow duration-300 hover:shadow-lift"
                        >
                            <span className="pointer-events-none absolute -bottom-8 -right-2 font-display text-[9rem] font-bold leading-none text-surface-2 transition-colors duration-500 group-hover:text-primary-soft">
                                {i + 1}
                            </span>
                            <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary-strong transition-all duration-300 group-hover:rotate-[-6deg] group-hover:bg-primary group-hover:text-white">
                                <Icon size={24} aria-hidden="true" />
                            </span>
                            <h3 className="relative mt-8 text-2xl font-bold">{title}</h3>
                            <p className="relative mt-3 text-muted">{desc}</p>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}

/** Closing call-to-action with a zooming panel and counter-moving glows. */
export function LandingCta() {
    const { t } = useLanguage();
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion();
    const k = reduce ? 0 : 1;
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
    const p = useSpring(scrollYProgress, PARALLAX_SPRING);
    const scale = useTransform(p, [0, 1], [1 - 0.1 * k, 1]);
    const radius = useTransform(p, [0, 1], [64, 32]);
    const yGlowA = useTransform(p, [0, 1], [-120 * k, 60 * k]);
    const yGlowB = useTransform(p, [0, 1], [140 * k, -40 * k]);
    const yText = useTransform(p, [0, 1], [80 * k, 0]);

    return (
        <section ref={ref} className="mx-auto max-w-6xl px-5 py-28">
            <motion.div
                style={{ scale, borderRadius: radius }}
                className="bg-ink relative overflow-hidden px-8 py-20 text-center text-white shadow-lift sm:py-28"
            >
                <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden="true" />
                <motion.div
                    style={{ y: yGlowA }}
                    className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/35 blur-[100px]"
                    aria-hidden="true"
                />
                <motion.div
                    style={{ y: yGlowB }}
                    className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary/50 blur-[100px]"
                    aria-hidden="true"
                />
                <motion.div style={{ y: yText }} className="relative">
                    <h2 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.08] sm:text-6xl">
                        {t.landing.ctaBottomTitle}
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">{t.landing.ctaBottomSub}</p>
                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        <ButtonLink id="cta-bottom-start" href="/register" variant="accent" size="lg" className="group">
                            {t.landing.ctaQuickCheck}
                            <ArrowRight
                                size={18}
                                aria-hidden="true"
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </ButtonLink>
                        <ButtonLink
                            id="cta-bottom-login"
                            href="/login"
                            size="lg"
                            className="border border-white/20 bg-white/5 text-white hover:bg-white/10"
                        >
                            {t.nav.signIn}
                        </ButtonLink>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
