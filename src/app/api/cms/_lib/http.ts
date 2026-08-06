import { NextResponse } from "next/server";

export type ApiErrorCode =
    | "BAD_REQUEST"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "INTERNAL_ERROR";

export type ApiErrorBody = {
    ok: false;
    error: {
        code: ApiErrorCode;
        message: string;
        details?: unknown;
    };
};

export type ApiSuccessBody<T> = {
    ok: true;
    data: T;
};

export function success<T>(data: T, status = 200): NextResponse<ApiSuccessBody<T>> {
    return NextResponse.json({ ok: true, data }, { status });
}

export function failure(
    code: ApiErrorCode,
    message: string,
    status: number,
    details?: unknown,
): NextResponse<ApiErrorBody> {
    return NextResponse.json(
        {
            ok: false,
            error: {
                code,
                message,
                details,
            },
        },
        { status },
    );
}

export function asError(error: unknown): { message: string; details?: unknown } {
    if (error instanceof Error) {
        const message = error.message;
        const isSafeRequestError = [
            "must",
            "Expected",
            "Duplicate",
            "invalid",
            "not allowed",
            "does not exist",
            "mismatch",
            "required",
            "unsafe",
            "too many",
            "too large",
            "forbidden",
            "editable",
        ].some((fragment) => message.includes(fragment));
        const containsSensitiveMaterial =
            /(?:password|secret|token|credential|api[-_. ]?key|database[_ -]?url|postgres(?:ql)?):?/i.test(message)
            || /(?:https?|postgres(?:ql)?):\/\//i.test(message)
            || /[\r\n]/.test(message);

        if (isSafeRequestError && message.length <= 240 && !containsSensitiveMaterial) {
            return { message };
        }

        console.error(`CMS API request failed (${error.name || "Error"}).`);
        return { message: "Unable to complete the CMS request." };
    }

    console.error("CMS API request failed with a non-error value.");
    return { message: "Unable to complete the CMS request." };
}
