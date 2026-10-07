import type { Metadata } from "next";
import { QuickCheck } from "@/components/quick-check";

export const metadata: Metadata = { title: "Quick Check | INKLUSA" };

export default function QuickCheckPage() {
    return <QuickCheck />;
}
