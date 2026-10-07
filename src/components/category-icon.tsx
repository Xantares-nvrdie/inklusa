import { BookOpen, ListChecks, PenLine, Target, Users } from "lucide-react";
import type { Category } from "@/lib/knowledge";

const MAP = {
    "list-checks": ListChecks,
    "book-open": BookOpen,
    target: Target,
    "pen-line": PenLine,
    users: Users,
};

export function CategoryIcon({ icon, size = 22 }: { icon: Category["icon"]; size?: number }) {
    const Icon = MAP[icon];
    return <Icon size={size} aria-hidden="true" />;
}
