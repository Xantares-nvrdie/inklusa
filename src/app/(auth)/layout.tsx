import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-canvas grid min-h-screen place-items-center px-5 py-10">
            <div className="w-full max-w-md space-y-6">
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
