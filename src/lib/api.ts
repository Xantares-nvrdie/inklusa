import toast from "react-hot-toast";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`/api${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = body?.message ?? `Request failed (${res.status})`;
        toast.error(message);
        throw new Error(message);
    }
    return res.json() as Promise<T>;
}
