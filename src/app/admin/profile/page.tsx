import type { Metadata } from "next";
import { ProfileView } from "@/components/profile-view";

export const metadata: Metadata = {
    title: "Profil Administrator | INKLUSA",
    description: "Kelola profil dan foto akun administrator",
};

export default function AdminProfilePage() {
    return <ProfileView isAdmin={true} />;
}
