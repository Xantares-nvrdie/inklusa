import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppNav } from "@/components/app-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");
    if ((session.user as { role?: string | null }).role === "ADMIN") redirect("/admin");

    return (
        <div className="bg-canvas relative min-h-screen overflow-x-hidden">
            <div className="bg-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
            <AppNav name={session.user.name} />
            <main className="relative z-10 mx-auto w-full max-w-6xl px-5 py-10 pb-28 md:pb-10">{children}</main>
        </div>
    );
}
