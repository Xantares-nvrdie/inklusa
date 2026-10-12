import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppNav } from "@/components/app-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");
    if ((session.user as { role?: string | null }).role === "ADMIN") redirect("/admin");

    return (
        // overflow-x-clip (not hidden) so the sticky header and action bars keep working.
        <div className="bg-canvas relative min-h-dvh overflow-x-clip">
            <div className="bg-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
            <AppNav name={session.user.name} image={session.user.image} />
            <main className="relative mx-auto w-full max-w-6xl px-4 pt-5 pb-bottom-nav sm:px-5 sm:pt-8 md:pt-10 md:pb-12">
                {children}
            </main>
        </div>
    );
}
