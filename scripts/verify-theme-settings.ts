import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

import { GET as getPublicSettings } from "../src/app/api/public/settings/route";
import { GET as getSettings, PUT as updateSetting } from "../src/app/api/cms/settings/route";
import { GET as getTheme, PUT as updateTheme } from "../src/app/api/cms/theme/route";
import { createDatabaseSession } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

const pepper = "theme-settings-verification-pepper-at-least-32-characters";
const marker = randomUUID();
let userId: string | null = null;
let privateSettingId: string | null = null;

function request(
    url: string,
    session: { sessionToken: string; csrfToken: string },
    init: { method?: string; body?: unknown } = {},
) {
    return new NextRequest(url, {
        method: init.method ?? "GET",
        headers: {
            cookie: `arandi_session=${session.sessionToken}; arandi_csrf=${session.csrfToken}`,
            ...(init.body ? { "Content-Type": "application/json" } : {}),
            ...(init.method && init.method !== "GET" ? { "x-csrf-token": session.csrfToken } : {}),
        },
        ...(init.body ? { body: JSON.stringify(init.body) } : {}),
    });
}

async function main() {
    const originalTheme = await prisma.theme.findFirstOrThrow({ where: { isDefault: true } });
    const originalCompany = await prisma.setting.findUniqueOrThrow({ where: { key: "site.company" } });
    try {
        const adminRole = await prisma.role.findUniqueOrThrow({ where: { key: "Admin" } });
        const user = await prisma.user.create({
            data: {
                displayName: "Temporary theme settings verification",
                email: `theme-settings-${marker}@example.test`,
                roles: { create: { roleId: adminRole.id } },
            },
        });
        userId = user.id;
        const session = await createDatabaseSession(user.id, { pepper });

        const themeRead = await getTheme(request("https://arandi.example/api/cms/theme", session));
        assert.equal(themeRead.status, 200);

        const unsafeTheme = await updateTheme(request(
            "https://arandi.example/api/cms/theme",
            session,
            {
                method: "PUT",
                body: {
                    id: originalTheme.id,
                    slug: originalTheme.slug,
                    name: originalTheme.name,
                    isDefault: true,
                    colors: { accent: "url(https://evil.example)" },
                    typography: {},
                    spacing: {},
                    radius: {},
                    shadows: {},
                    semanticTokens: {},
                    componentOverrides: {},
                },
            },
        ));
        assert.equal(unsafeTheme.status, 400);

        const validTheme = await updateTheme(request(
            "https://arandi.example/api/cms/theme",
            session,
            {
                method: "PUT",
                body: {
                    id: originalTheme.id,
                    slug: originalTheme.slug,
                    name: originalTheme.name,
                    isDefault: true,
                    colors: { "--primary": "var(--primary)" },
                    typography: { "--font-body": "var(--font-body)" },
                    spacing: {},
                    radius: {},
                    shadows: {},
                    semanticTokens: { accent: "var(--primary)" },
                    componentOverrides: {},
                },
            },
        ));
        assert.equal(validTheme.status, 200);

        const privateSetting = await prisma.setting.create({
            data: {
                key: `smtp.password.${marker}`,
                value: { verification: true },
                group: "verification",
                isPublic: false,
            },
        });
        privateSettingId = privateSetting.id;

        const settingsRead = await getSettings(request(
            "https://arandi.example/api/cms/settings",
            session,
        ));
        assert.equal(settingsRead.status, 200);
        const settingsBody = await settingsRead.json() as {
            data: Array<{ id: string; value: unknown; redacted: boolean }>;
        };
        const redacted = settingsBody.data.find(({ id }) => id === privateSettingId);
        assert.equal(redacted?.redacted, true);
        assert.equal(redacted?.value, null);

        const forbiddenKey = await updateSetting(request(
            "https://arandi.example/api/cms/settings",
            session,
            { method: "PUT", body: { key: "smtp.password", value: {} } },
        ));
        assert.equal(forbiddenKey.status, 400);
        const forbiddenNestedSecret = await updateSetting(request(
            "https://arandi.example/api/cms/settings",
            session,
            { method: "PUT", body: { key: "site.company", value: { apiKey: "never" } } },
        ));
        assert.equal(forbiddenNestedSecret.status, 400);
        const validSetting = await updateSetting(request(
            "https://arandi.example/api/cms/settings",
            session,
            {
                method: "PUT",
                body: { key: "site.company", value: { name: "Arandi Bonyan Verification" } },
            },
        ));
        assert.equal(validSetting.status, 200);

        const publicSettings = await getPublicSettings();
        assert.equal(publicSettings.status, 200);
        const publicBody = await publicSettings.json() as { items: Array<{ key: string }> };
        assert.equal(publicBody.items.some(({ key }) => key.includes("smtp")), false);
    } finally {
        await prisma.theme.update({
            where: { id: originalTheme.id },
            data: {
                slug: originalTheme.slug,
                name: originalTheme.name,
                isDefault: originalTheme.isDefault,
                tokens: originalTheme.tokens as Prisma.InputJsonValue,
                semanticTokens: originalTheme.semanticTokens as Prisma.InputJsonValue,
                componentOverrides: originalTheme.componentOverrides as Prisma.InputJsonValue,
            },
        });
        await prisma.setting.update({
            where: { id: originalCompany.id },
            data: { value: originalCompany.value as Prisma.InputJsonValue },
        });
        if (privateSettingId) await prisma.setting.deleteMany({ where: { id: privateSettingId } });
        if (userId) {
            await prisma.securityEvent.deleteMany({ where: { userId } });
            await prisma.user.deleteMany({ where: { id: userId } });
        }
        await prisma.$disconnect();
    }
    console.log("Theme/settings runtime verification passed; original values restored and temporary records removed.");
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Theme/settings verification failed.");
    process.exitCode = 1;
});
