import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/lib/i18n/context";
import { KnowledgeProvider } from "@/lib/knowledge-context";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    viewportFit: "cover",
    themeColor: "#1f7a70",
};

export const metadata: Metadata = {
    title: "INKLUSA | Classroom Intervention Assistant",
    description:
        "See the barrier. Support the learner. INKLUSA helps teachers in inclusive classrooms turn observed learning barriers into structured, trackable interventions.",
    icons: {
        icon: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }, { url: "/favicon.ico" }],
        apple: [{ url: "/apple-icon.png", sizes: "512x512", type: "image/png" }],
        shortcut: ["/favicon.ico"],
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="id" className={cn("scroll-smooth", inter.variable, outfit.variable)}>
            <body className="min-h-screen font-sans antialiased">
                <LanguageProvider>
                    <KnowledgeProvider>
                        {children}
                        <Toaster
                            position="top-center"
                            containerStyle={{ top: "calc(env(safe-area-inset-top) + 4.5rem)" }}
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    borderRadius: "1rem",
                                    background: "#fff",
                                    color: "#16302d",
                                    maxWidth: "min(28rem, calc(100vw - 2rem))",
                                    fontSize: "0.9rem",
                                    boxShadow: "0 2px 4px rgba(25,60,55,.05), 0 20px 44px -16px rgba(25,60,55,.22)",
                                },
                            }}
                        />
                    </KnowledgeProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
