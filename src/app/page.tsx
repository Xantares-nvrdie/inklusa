"use client";

import { ArrowRight, Check, Eye, Lightbulb, MessageSquareHeart, Route, ShieldCheck, Sparkles, UserRoundCheck } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useKnowledge } from "@/lib/knowledge-context";
import { useLanguage } from "@/lib/i18n/context";

export default function LandingPage() {
    const { t, locale } = useLanguage();
    const { categories, getIntervention } = useKnowledge();
    const sample = getIntervention("graphic-organizer");

    const loopSteps = [
        { title: t.landing.loop.observe.title, text: t.landing.loop.observe.desc, Icon: Eye, tone: "bg-sky-soft text-sky" },
        { title: t.landing.loop.understand.title, text: t.landing.loop.understand.desc, Icon: Lightbulb, tone: "bg-accent-soft text-[#9a5612]" },
        { title: t.landing.loop.act.title, text: t.landing.loop.act.desc, Icon: Route, tone: "bg-primary-soft text-primary-strong" },
        { title: t.landing.loop.reflect.title, text: t.landing.loop.reflect.desc, Icon: MessageSquareHeart, tone: "bg-[#f3e6f7] text-[#7a3f8f]" },
    ];

    return (
        <>
            <SiteNav />
            <main>
                {/* HERO */}
                <section className="bg-canvas relative overflow-hidden">
                    <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-20 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-8">
                            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium text-primary-strong shadow-soft">
                                <Sparkles size={14} aria-hidden="true" /> {t.landing.taglineBadge}
                            </span>
                            <h1 className="text-5xl font-bold sm:text-6xl lg:text-7xl">
                                {t.landing.heroTitle1}
                                <br />
                                <span className="text-gradient">{t.landing.heroTitleHighlight}</span>
                            </h1>
                            <p className="max-w-xl text-lg text-muted">
                                {t.landing.heroDescription}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <ButtonLink id="cta-hero-start" href="/register" size="lg">
                                    {t.landing.ctaQuickCheck} <ArrowRight size={18} aria-hidden="true" />
                                </ButtonLink>
                                <ButtonLink href="#how" variant="outline" size="lg">{t.landing.ctaHow}</ButtonLink>
                            </div>
                            <p className="text-sm text-muted">{t.landing.quote}</p>
                        </div>

                        {/* Product preview */}
                        <div className="relative">
                            <div className="animate-float-slow">
                                <Card className="space-y-5 p-7 shadow-lift">
                                    <p className="text-sm font-semibold uppercase tracking-wider text-muted">{t.landing.observedBarrier}</p>
                                    <h2 className="text-2xl font-bold">{t.landing.sampleBarrierTitle}</h2>
                                    <p className="text-muted">
                                        {t.landing.sampleBarrierDesc}
                                    </p>
                                    <div className="space-y-2.5 border-t border-line pt-5">
                                        {[
                                            locale === "id" ? "Pengatur Grafis (Graphic Organizer)" : "Graphic Organizer",
                                            locale === "id" ? "Pemandu Menulis Berstruktur" : "Structured Writing Prompt",
                                            locale === "id" ? "Format Respons Alternatif" : "Alternative Response Format",
                                        ].map((s, i) => (
                                            <div key={s} className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3">
                                                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-white">{i + 1}</span>
                                                <span className="font-medium">{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-line bg-surface px-4 py-3 shadow-lift sm:flex sm:items-center sm:gap-3">
                                <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-[#9a5612]"><UserRoundCheck size={18} aria-hidden="true" /></span>
                                <span className="text-sm font-semibold">{t.landing.teacherDecides}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PROBLEM */}
                <section id="problem" className="mx-auto max-w-6xl px-5 py-24">
                    <Reveal className="mx-auto max-w-2xl space-y-4 text-center">
                        <h2 className="text-4xl font-bold">{t.landing.problemTitle}</h2>
                        <p className="text-lg text-muted">{t.landing.problemSub}</p>
                    </Reveal>
                    <div className="mt-12 grid gap-4 md:grid-cols-2">
                        {t.landing.problems.map((p, i) => (
                            <Reveal key={p} delay={i * 0.07}>
                                <Card interactive className="flex h-full items-start gap-4">
                                    <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft font-display font-bold text-[#9a5612]">{i + 1}</span>
                                    <p className="text-lg">{p}</p>
                                </Card>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* HOW */}
                <section id="how" className="bg-surface-2/70 py-24">
                    <div className="mx-auto max-w-6xl px-5">
                        <Reveal className="mx-auto max-w-2xl space-y-4 text-center">
                            <h2 className="text-4xl font-bold">{t.landing.loopTitle}</h2>
                            <p className="text-lg text-muted">{t.landing.loopSub}</p>
                        </Reveal>
                        <div className="mt-14 grid gap-5 md:grid-cols-4">
                            {loopSteps.map(({ title, text, Icon, tone }, i) => (
                                <Reveal key={title} delay={i * 0.08}>
                                    <Card interactive className="relative h-full space-y-4">
                                        <span className={`grid h-12 w-12 place-items-center rounded-2xl ${tone}`}><Icon size={22} aria-hidden="true" /></span>
                                        <p className="text-sm font-semibold text-muted">0{i + 1}</p>
                                        <h3 className="text-2xl font-bold">{title}</h3>
                                        <p className="text-muted">{text}</p>
                                    </Card>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SUPPORTS */}
                <section id="supports" className="mx-auto max-w-6xl px-5 py-24">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <Reveal className="space-y-6">
                            <h2 className="text-4xl font-bold">{t.landing.supportsTitle}</h2>
                            <p className="text-lg text-muted">
                                {t.landing.supportsDesc}
                            </p>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {categories.map((c) => (
                                    <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
                                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary-strong"><CategoryIcon icon={c.icon} size={20} /></span>
                                        <span className="font-semibold">{c.title}</span>
                                    </div>
                                ))}
                            </div>
                        </Reveal>
                        {sample && (
                            <Reveal delay={0.1}>
                                <Card className="space-y-5 p-8 shadow-lift">
                                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">{t.landing.exampleStrategy}</p>
                                    <h3 className="text-3xl font-bold">{sample.title}</h3>
                                    <p className="text-muted"><strong className="text-foreground">{t.landing.whyTryThis}</strong> {sample.why}</p>
                                    <ol className="space-y-3">
                                        {sample.steps.map((s, i) => (
                                            <li key={s} className="flex items-center gap-4">
                                                <span className="font-display text-lg font-bold text-accent">0{i + 1}</span>
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ol>
                                    <p className="rounded-2xl bg-surface-2 px-4 py-3 text-sm"><strong>{t.landing.whatToObserve}</strong> {sample.observe}</p>
                                </Card>
                            </Reveal>
                        )}
                    </div>
                </section>

                {/* PRINCIPLES */}
                <section id="principles" className="bg-surface-2/70 py-24">
                    <div className="mx-auto max-w-6xl px-5">
                        <Reveal className="mx-auto max-w-2xl text-center">
                            <h2 className="text-4xl font-bold">{t.landing.promisesTitle}</h2>
                        </Reveal>
                        <div className="mt-12 grid gap-5 md:grid-cols-3">
                            {[
                                { t: t.landing.promises.p1Title, d: t.landing.promises.p1Desc, Icon: ShieldCheck },
                                { t: t.landing.promises.p2Title, d: t.landing.promises.p2Desc, Icon: UserRoundCheck },
                                { t: t.landing.promises.p3Title, d: t.landing.promises.p3Desc, Icon: Check },
                            ].map(({ t: title, d, Icon }, i) => (
                                <Reveal key={title} delay={i * 0.08}>
                                    <Card interactive className="h-full space-y-3">
                                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary-strong"><Icon size={22} aria-hidden="true" /></span>
                                        <h3 className="text-xl font-bold">{title}</h3>
                                        <p className="text-muted">{d}</p>
                                    </Card>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="mx-auto max-w-6xl px-5 py-24">
                    <Reveal>
                        <div className="relative overflow-hidden rounded-[2rem] bg-primary-strong px-8 py-16 text-center text-white shadow-lift">
                            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
                            <h2 className="relative text-4xl font-bold sm:text-5xl">{t.landing.ctaBottomTitle}</h2>
                            <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/80">
                                {t.landing.ctaBottomSub}
                            </p>
                            <div className="relative mt-8">
                                <ButtonLink id="cta-bottom-start" href="/register" variant="accent" size="lg">
                                    {t.landing.ctaQuickCheck} <ArrowRight size={18} aria-hidden="true" />
                                </ButtonLink>
                            </div>
                        </div>
                    </Reveal>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
