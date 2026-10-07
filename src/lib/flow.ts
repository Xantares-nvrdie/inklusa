/** Carries the Quick Check context through the flow via the URL (no extra data stored). */
export interface FlowCtx {
    student: string; // student id or "general"
    cat: string;
    clar: string;
}

export const flowQs = (c: FlowCtx) => new URLSearchParams({ student: c.student, cat: c.cat, clar: c.clar }).toString();
