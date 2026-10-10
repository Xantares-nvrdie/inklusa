"use client";

import { LandingCta, LandingPrinciples } from "@/components/landing/closing";
import { LandingHero } from "@/components/landing/hero";
import { LandingLoop } from "@/components/landing/loop";
import { LandingManifesto } from "@/components/landing/manifesto";
import { LandingProblem } from "@/components/landing/problem";
import { ScrollProgress } from "@/components/landing/shared";
import { LandingSupports } from "@/components/landing/supports";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

/**
 * Landing page — a scroll-driven narrative:
 * Hero (layered parallax) → Manifesto (word reveal) → Problem (staggered columns)
 * → How it works (pinned storytelling) → Supports (horizontal track)
 * → Principles (depth cards) → CTA.
 */
export default function LandingPage() {
    return (
        <>
            <ScrollProgress />
            <SiteNav />
            <main className="overflow-x-clip">
                <LandingHero />
                <LandingManifesto />
                <LandingProblem />
                <LandingLoop />
                <LandingSupports />
                <LandingPrinciples />
                <LandingCta />
            </main>
            <SiteFooter />
        </>
    );
}
