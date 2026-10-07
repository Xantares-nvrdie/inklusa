import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { auth } from "@/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");
    if ((session.user as { role?: string | null }).role === "ADMIN") redirect("/admin");

    return (
        <div className="bg-canvas min-h-screen">
            <AppNav name={session.user.name} />
            <main className="mx-auto w-full max-w-6xl px-5 py-10">{children}</main>
        </div>
    );
}
