"use client";

import { type MotionValue, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, MoveRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { useLanguage } from "@/lib/i18n/context";
import { useKnowledge } from "@/lib/knowledge-context";
import { cn } from "@/lib/utils";
import { CarouselDots, CarouselEndSpacer, carouselTrackCls, Eyebrow, PARALLAX_SPRING, useSnapCarousel } from "./shared";

const CARD_TONES = [
    { bg: "from-[#dff1ed] to-[#f5fbf9]", icon: "bg-primary text-white", ring: "hover:ring-primary/30" },
    { bg: "from-[#fdeedb] to-[#fffaf3]", icon: "bg-accent text-[#3b2208]", ring: "hover:ring-accent/30" },
    { bg: "from-[#e3effa] to-[#f6fafe]", icon: "bg-sky text-white", ring: "hover:ring-sky/30" },
    { bg: "from-[#f3e6f7] to-[#fcf8fd]", icon: "bg-[#7a3f8f] text-white", ring: "hover:ring-[#7a3f8f]/30" },
    { bg: "from-[#e6f2df] to-[#f8fcf6]", icon: "bg-success text-white", ring: "hover:ring-success/30" },
];

type Category = ReturnType<typeof useKnowledge>["categories"][number];
type Intervention = NonNullable<ReturnType<ReturnType<typeof useKnowledge>["getIntervention"]>>;

function CategoryCard({
    category,
    index,
    count,
    className,
    iconX,
    slideLabel,
}: {
    category: Category;
    index: number;
    count: number;
    className?: string;
    iconX?: MotionValue<number>;
    slideLabel?: string;
}) {
    const { t } = useLanguage();
    const tone = CARD_TONES[index % CARD_TONES.length];
    return (
        <article
            aria-roledescription={slideLabel ? "slide" : undefined}
            aria-label={slideLabel}
            className={cn(
                `group relative flex shrink-0 flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br ${tone.bg} p-5 xs:p-6 sm:p-7 ring-1 ring-line transition-all duration-500 hover:-translate-y-2 hover:shadow-lift ${tone.ring} hover:ring-4`,
                className,
            )}
        >
            <motion.div
                style={iconX ? { x: iconX } : undefined}
                className="pointer-events-none absolute -right-10 -top-10 opacity-[0.07]"
                aria-hidden="true"
            >
                <CategoryIcon icon={category.icon} size={220} />
            </motion.div>
            <span className="font-display text-sm font-semibold text-muted">0{index + 1}</span>
            <span
                className={`mt-4 sm:mt-6 grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl shadow-soft ${tone.icon}`}
            >
                <CategoryIcon icon={category.icon} size={24} />
            </span>
            <h3 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold">{category.title}</h3>
            <p className="mt-2.5 sm:mt-3 line-clamp-4 text-sm sm:text-base text-muted">{category.description}</p>
            <div className="mt-auto flex items-center justify-between border-t border-foreground/10 pt-4 sm:pt-5">
                <span className="text-xs sm:text-sm font-semibold">{t.landing.strategyCount(count)}</span>
                <span className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full bg-surface text-foreground shadow-soft transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight size={16} aria-hidden="true" />
                </span>
            </div>
        </article>
    );
}

function SampleCard({
    sample,
    className,
    slideLabel,
}: {
    sample: Intervention;
    className?: string;
    slideLabel?: string;
}) {
    const { t } = useLanguage();
    return (
        <article
            aria-roledescription={slideLabel ? "slide" : undefined}
            aria-label={slideLabel}
            className={cn(
                "relative flex shrink-0 flex-col overflow-hidden rounded-[2rem] bg-primary-strong p-5 xs:p-6 sm:p-8 text-white shadow-lift",
                className,
            )}
        >
            <div
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/40 blur-3xl"
                aria-hidden="true"
            />
            <p className="relative text-xs font-semibold uppercase tracking-widest text-white/60">
                {t.landing.exampleStrategy}
            </p>
            <h3 className="relative mt-2.5 sm:mt-3 text-xl xs:text-2xl sm:text-3xl font-bold">{sample.title}</h3>
            <p className="relative mt-2 sm:mt-3 line-clamp-3 text-xs sm:text-sm text-white/75">
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
                <strong>{t.landing.whatToObserve}</strong> <span className="text-white/80">{sample.observe}</span>
            </p>
        </article>
    );
}

export function LandingSupports() {
    return (
        <section id="supports" className="relative bg-background">
            <SupportsPinned />
            <SupportsCarousel />
        </section>
    );
}

/**
 * Desktop: horizontal parallax track — vertical scroll is translated into
 * sideways movement while the section is pinned. Card artwork drifts slower
 * than the cards themselves for an extra layer of depth.
 */
function SupportsPinned() {
    const { t } = useLanguage();
    const { categories, interventions, getIntervention } = useKnowledge();
    const sample = getIntervention("graphic-organizer");
    const ref = useRef<HTMLDivElement>(null);
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
        <div ref={ref} className="relative hidden h-[320vh] lg:block">
            <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
                <motion.div
                    ref={trackRef}
                    style={{ x }}
                    className="flex w-max items-stretch gap-6 px-5 lg:px-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))]"
                >
                    {/* Intro panel */}
                    <div className="flex w-[min(30rem,82vw)] shrink-0 flex-col justify-center pr-6">
                        <Eyebrow>{t.landing.eyebrowSupports}</Eyebrow>
                        <h2 className="mt-5 text-5xl font-bold leading-[1.1]">{t.landing.supportsTitle}</h2>
                        <p className="mt-5 text-lg text-muted">{t.landing.supportsDesc}</p>
                        <p className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary">
                            <MoveRight size={16} aria-hidden="true" /> {t.landing.dragHint}
                        </p>
                    </div>

                    {categories.map((c, i) => (
                        <CategoryCard
                            key={c.id}
                            category={c}
                            index={i}
                            count={interventions.filter((iv) => iv.category === c.id).length}
                            iconX={iconX}
                            className="h-[min(30rem,68svh)] w-[min(21rem,78vw)]"
                        />
                    ))}

                    {sample && <SampleCard sample={sample} className="h-[min(30rem,68svh)] w-[min(26rem,85vw)]" />}
                </motion.div>

                {/* Progress rail */}
                <div className="mx-auto mt-10 h-1 w-48 overflow-hidden rounded-full bg-line" aria-hidden="true">
                    <motion.div
                        style={{ width: bar }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    />
                </div>
            </div>
        </div>
    );
}

/** Phones & tablets: native swipe carousel — no pinning, no scroll hijacking. */
function SupportsCarousel() {
    const { t } = useLanguage();
    const { categories, interventions, getIntervention } = useKnowledge();
    const sample = getIntervention("graphic-organizer");
    const { ref, active, progress, scrollTo } = useSnapCarousel();
    const total = categories.length + (sample ? 1 : 0);

    return (
        <div className="py-16 sm:py-24 lg:hidden">
            <div className="mx-auto max-w-2xl px-4 sm:px-5">
                <Eyebrow>{t.landing.eyebrowSupports}</Eyebrow>
                <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.12] xs:text-3xl sm:mt-5 sm:text-4xl">
                    {t.landing.supportsTitle}
                </h2>
                <p className="mt-3 text-[0.95rem] text-muted sm:mt-4 sm:text-lg">{t.landing.supportsDesc}</p>
            </div>

            <section
                ref={ref}
                aria-roledescription="carousel"
                aria-label={t.landing.eyebrowSupports}
                className={cn(carouselTrackCls, "mt-7 items-stretch pt-1")}
            >
                {categories.map((c, i) => (
                    <div key={c.id} data-slide className="flex w-[78%] max-w-[20rem] shrink-0 snap-start">
                        <CategoryCard
                            category={c}
                            index={i}
                            count={interventions.filter((iv) => iv.category === c.id).length}
                            className="min-h-[19rem] w-full hover:translate-y-0"
                            slideLabel={`${i + 1} / ${total}`}
                        />
                    </div>
                ))}
                {sample && (
                    <div data-slide className="flex w-[86%] max-w-[24rem] shrink-0 snap-start">
                        <SampleCard
                            sample={sample}
                            className="min-h-[19rem] w-full"
                            slideLabel={`${total} / ${total}`}
                        />
                    </div>
                )}
                <CarouselEndSpacer />
            </section>

            <div className="mx-auto mt-4 flex max-w-2xl items-center justify-between gap-4 px-4 sm:px-5">
                <p className="inline-flex items-center gap-2 text-xs font-medium text-primary">
                    <MoveRight size={15} aria-hidden="true" className={progress < 0.02 ? "animate-pulse" : ""} />
                    {t.landing.swipeHint}
                </p>
                <CarouselDots
                    count={total}
                    active={active}
                    onSelect={scrollTo}
                    label={(i) => (i < categories.length ? categories[i].title : t.landing.exampleStrategy)}
                />
            </div>
        </div>
    );
}
