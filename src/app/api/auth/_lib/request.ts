export { readBoundedJson, RequestBodyTooLargeError } from "@/lib/http/boundedJson";

export function isSameOrigin(request: Request): boolean {
    const origin = request.headers.get("origin");
    if (!origin) return false;
    try {
        const configuredSiteUrl = process.env.ARANDI_SITE_URL?.trim();
        const expectedOrigin = configuredSiteUrl
            ? new URL(configuredSiteUrl).origin
            : new URL(request.url).origin;
        return new URL(origin).origin === expectedOrigin;
    } catch {
        return false;
    }
}

export function requestIp(request: Request): string | null {
    return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || request.headers.get("x-real-ip")?.trim()
        || null;
}

export function requestBodyTooLarge(request: Request, maxBytes = 4_096): boolean {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    return Number.isFinite(contentLength) && contentLength > maxBytes;
}
