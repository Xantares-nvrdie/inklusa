import { Suspense } from "react";
import { InterventionDetail } from "@/components/intervention-detail";
import { getIntervention } from "@/lib/knowledge";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return { title: `${getIntervention(slug)?.title ?? "Strategy"} | INKLUSA` };
}

export default async function InterventionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
        <Suspense>
            <InterventionDetail slug={slug} />
        </Suspense>
    );
}
