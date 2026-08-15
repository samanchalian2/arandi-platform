import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

import { requestBodyTooLarge } from "@/app/api/auth/_lib/request";
import { prisma } from "@/lib/prisma";
import { PUBLIC_SETTINGS_TAG, revalidatePublicContent } from "@/lib/public-content/cache";

import { asError, failure, success } from "../_lib/http";
import {
    isPrivateEditableSettingKey,
    isSecretBearingSettingKey,
    parseEditableSettingKey,
    parsePublicSettingValue,
    parseSettingValue,
} from "../_lib/setting-input";
import { parseAIRuntimeSelection } from "@/lib/ai/config";
import { requirePermission } from "../_lib/security";
import { readJson } from "../_lib/validation";

export const runtime = "nodejs";

function mapSetting(setting: {
    id: string;
    key: string;
    value: Prisma.JsonValue;
    group: string | null;
    isPublic: boolean;
    updatedAt: Date;
}) {
    const redacted = isSecretBearingSettingKey(setting.key);
    return {
        id: setting.id,
        key: setting.key,
        value: redacted ? null : setting.value,
        group: setting.group,
        isPublic: setting.isPublic,
        redacted,
        updatedAt: setting.updatedAt,
    };
}

export async function GET(request: NextRequest) {
    const forbidden = await requirePermission(request, "setting.read");
    if (forbidden) return forbidden;
    try {
        const settings = await prisma.setting.findMany({
            orderBy: [{ group: "asc" }, { key: "asc" }],
        });
        return success(settings.map(mapSetting));
    } catch (error) {
        const err = asError(error);
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}

export async function PUT(request: NextRequest) {
    if (requestBodyTooLarge(request, 12_288)) {
        return failure("BAD_REQUEST", "Request is too large.", 413);
    }
    const forbidden = await requirePermission(request, "setting.write");
    if (forbidden) return forbidden;
    try {
        const body = await readJson(request);
        const key = parseEditableSettingKey(body.key);
        const value = parsePublicSettingValue(key, parseSettingValue(body.value));
        if (key === "ai.runtime") parseAIRuntimeSelection(value);
        const existing = await prisma.setting.findUnique({ where: { key } });
        if (!existing) return failure("NOT_FOUND", "Setting not found.", 404);
        if (!existing.isPublic && !isPrivateEditableSettingKey(key)) {
            return failure("FORBIDDEN", "Private settings cannot be edited through this endpoint.", 403);
        }
        const updated = await prisma.setting.update({
            where: { key },
            data: { value: value as Prisma.InputJsonValue },
        });
        revalidatePublicContent(PUBLIC_SETTINGS_TAG);
        return success(mapSetting(updated));
    } catch (error) {
        const err = asError(error);
        if (err.message !== "Unable to complete the CMS request.") {
            return failure("BAD_REQUEST", err.message, 400);
        }
        return failure("INTERNAL_ERROR", err.message, 500, err.details);
    }
}
