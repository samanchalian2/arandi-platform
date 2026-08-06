import { NextRequest, NextResponse } from "next/server";

import {
    AccountForbiddenError,
    AccountUnauthorizedError,
    requireAccountPermission,
} from "./_lib/security";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    try {
        const session = await requireAccountPermission(request, "account.read");
        return NextResponse.json({
            id: session.userId,
            displayName: session.displayName,
            phoneE164: session.phoneE164,
            email: session.email,
        });
    } catch (error) {
        if (error instanceof AccountUnauthorizedError) {
            return NextResponse.json({ message: "Authentication required." }, { status: 401 });
        }
        if (error instanceof AccountForbiddenError) {
            return NextResponse.json({ message: "Forbidden." }, { status: 403 });
        }
        return NextResponse.json({ message: "Account is unavailable." }, { status: 503 });
    }
}
