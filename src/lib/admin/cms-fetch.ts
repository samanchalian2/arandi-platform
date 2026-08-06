import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/auth/csrf";

function cookieValue(name: string): string | null {
    if (typeof document === "undefined") return null;
    const prefix = `${encodeURIComponent(name)}=`;
    const part = document.cookie.split("; ").find((item) => item.startsWith(prefix));
    return part ? decodeURIComponent(part.slice(prefix.length)) : null;
}

export function cmsFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const method = (init.method ?? "GET").toUpperCase();
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
        return fetch(input, init);
    }
    const headers = new Headers(init.headers);
    const csrf = cookieValue(CSRF_COOKIE);
    if (csrf) headers.set(CSRF_HEADER, csrf);
    return fetch(input, { ...init, headers });
}
