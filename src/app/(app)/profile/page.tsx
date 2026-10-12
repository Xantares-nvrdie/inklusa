import type { Metadata } from "next";
import { ProfileView } from "@/components/profile-view";

export const metadata: Metadata = {
    title: "Profil Pengguna | INKLUSA",
    description: "Kelola profil dan foto akun Anda",
};

export default function ProfilePage() {
    return <ProfileView isAdmin={false} />;
}
