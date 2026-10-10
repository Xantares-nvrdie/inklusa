import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-canvas relative grid min-h-screen place-items-center px-5 py-10 overflow-hidden">
            <div className="bg-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
            <div
                className="pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full bg-primary/20 blur-[120px]"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-accent/20 blur-[120px]"
                aria-hidden="true"
            />
            <div className="w-full max-w-md space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                    <Logo />
                    <LanguageSwitcher />
                </div>
                {children}
                <p className="text-center text-xs text-muted">
                    INKLUSA stores only minimal student identifiers. It never diagnoses.
                </p>
            </div>
        </div>
    );
}
