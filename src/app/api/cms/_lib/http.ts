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

        if (message.includes("Environment variable not found: DATABASE_URL")) {
            return { message: "Database is not configured. Set DATABASE_URL and retry." };
        }

        if (message.includes("Can't reach database server")) {
            return { message: "Database is unavailable. Check connection and retry." };
        }

        return { message };
    }

    return {
        message: "Unexpected error.",
        details: error,
    };
}
