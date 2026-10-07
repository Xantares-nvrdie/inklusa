import type { Metadata } from "next";
import { Suspense } from "react";
import { Supports } from "@/components/supports";

export const metadata: Metadata = { title: "Possible Supports | INKLUSA" };

export default function SupportsPage() {
    return (
        <Suspense>
            <Supports />
        </Suspense>
    );
}
