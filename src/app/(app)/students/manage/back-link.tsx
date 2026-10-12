"use client";

import { BackLink } from "@/components/ui/back-link";
import { useLanguage } from "@/lib/i18n/context";

/** "Manage classes" has no tab of its own, so give phones an obvious way back. */
export function ManageBackLink() {
    const { t } = useLanguage();
    return <BackLink href="/students" label={t.students.allStudents} />;
}
