import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { RequestBodyTooLargeError } from "@/lib/http/boundedJson";
import {
    AdminIdentityForbiddenError,
    AdminIdentityUnauthorizedError,
} from "./security";
import { UserInputError } from "@/lib/admin/users/input";
import {
    UserAdministrationConflictError,
    UserAdministrationNotFoundError,
} from "@/lib/admin/users/service";

export class AdminIdentityValidationError extends Error {}
export class AdminIdentityConflictError extends Error {}

export function adminIdentityErrorResponse(error: unknown) {
    if (error instanceof RequestBodyTooLargeError) {
        return NextResponse.json({ message: "Request is too large." }, { status: 413 });
    }
    if (error instanceof AdminIdentityUnauthorizedError) {
        return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }
    if (error instanceof AdminIdentityForbiddenError) {
        return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }
    if (
        error instanceof AdminIdentityValidationError
        || error instanceof UserInputError
        || error instanceof SyntaxError
        || error instanceof TypeError
    ) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Invalid request." },
            { status: 400 },
        );
    }
    if (
        error instanceof AdminIdentityConflictError
        || error instanceof UserAdministrationConflictError
    ) {
        return NextResponse.json({ message: error.message || "The operation conflicts with the current state." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ message: "The user conflicts with an existing record." }, { status: 409 });
    }
    if (error instanceof UserAdministrationNotFoundError) {
        return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "User administration is unavailable." }, { status: 503 });
}
