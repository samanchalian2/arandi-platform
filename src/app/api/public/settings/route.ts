import { NextResponse } from "next/server";

import {
    EDITABLE_SETTING_KEYS,
    isSecretBearingSettingKey,
} from "@/app/api/cms/_lib/setting-input";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
    const settings = await prisma.setting.findMany({
        where: {
            isPublic: true,
            key: { in: [...EDITABLE_SETTING_KEYS] },
        },
        orderBy: { key: "asc" },
        select: { key: true, value: true, updatedAt: true },
    });
    return NextResponse.json({
        items: settings
            .filter(({ key }) => !isSecretBearingSettingKey(key))
            .map(({ key, value, updatedAt }) => ({ key, value, updatedAt })),
    });
}
