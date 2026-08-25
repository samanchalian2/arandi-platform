import type { NextRequest } from "next/server";

import { getAnalyticsSummary } from "@/lib/analytics";

import { asError, failure, success } from "../_lib/http";
import { requirePermission } from "../_lib/security";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    const forbidden = await requirePermission(request, "analytics.read");
    if (forbidden) return forbidden;
    try { return success(await getAnalyticsSummary(Number(request.nextUrl.searchParams.get("days") ?? "30"))); }
    catch (error) { const err = asError(error); return failure("INTERNAL_ERROR", err.message, 500, err.details); }
}
