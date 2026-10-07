import type { Metadata } from "next";
import { Library } from "@/components/library";

export const metadata: Metadata = { title: "Intervention Library | INKLUSA" };

export default function InterventionsPage() {
    return <Library />;
}
