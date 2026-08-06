export class RequestBodyTooLargeError extends Error {
    constructor() {
        super("Request body is too large.");
        this.name = "RequestBodyTooLargeError";
    }
}

export async function readBoundedJson(request: Request, maxBytes: number): Promise<unknown> {
    const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
    if (contentType !== "application/json") {
        throw new TypeError("Content-Type must be application/json.");
    }

    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
        throw new RequestBodyTooLargeError();
    }
    if (!request.body) {
        throw new SyntaxError("Request body is required.");
    }

    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            totalBytes += value.byteLength;
            if (totalBytes > maxBytes) {
                await reader.cancel();
                throw new RequestBodyTooLargeError();
            }
            chunks.push(value);
        }
    } finally {
        reader.releaseLock();
    }

    const body = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
        body.set(chunk, offset);
        offset += chunk.byteLength;
    }

    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body));
}
