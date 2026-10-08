import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/lib/i18n/context";
import { KnowledgeProvider } from "@/lib/knowledge-context";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "INKLUSA | Classroom Intervention Assistant",
    description:
        "See the barrier. Support the learner. INKLUSA helps teachers in inclusive classrooms turn observed learning barriers into structured, trackable interventions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="id" className={cn("scroll-smooth", inter.variable, outfit.variable)}>
            <body className="min-h-screen font-sans antialiased">
                <LanguageProvider>
                    <KnowledgeProvider>
                        {children}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: { borderRadius: "1rem", background: "#fff", color: "#16302d" },
                            }}
                        />
                    </KnowledgeProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
