import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");
    if ((session.user as { role?: string | null }).role !== "ADMIN") redirect("/dashboard");

    return (
        <div className="bg-canvas relative min-h-screen overflow-x-hidden">
            <div className="bg-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
            <AdminNav name={session.user.name} />
            <main className="mx-auto w-full max-w-6xl px-5 py-10 relative z-10">{children}</main>
        </div>
    );
}
