export { readBoundedJson, RequestBodyTooLargeError } from "@/lib/http/boundedJson";

export function isSameOrigin(request: Request): boolean {
    const origin = request.headers.get("origin");
    if (!origin) return false;
    try {
        const configuredSiteUrl = process.env.ARANDI_SITE_URL?.trim();
        const expectedOrigin = configuredSiteUrl
            ? new URL(configuredSiteUrl).origin
            : new URL(request.url).origin;
        const actualOrigin = new URL(origin).origin;
        if (actualOrigin === expectedOrigin) return true;

        // The public host is currently served over HTTP while its canonical URL
        // remains HTTPS-ready. Only the reverse proxy may attest the externally
        // observed protocol; this keeps the accepted host pinned to configuration.
        const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
        const expected = new URL(expectedOrigin);
        const received = new URL(actualOrigin);
        return (
            (forwardedProto === "http" || forwardedProto === "https")
            && forwardedProto === received.protocol.slice(0, -1)
            && received.hostname === expected.hostname
            && received.port === expected.port
        );
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
