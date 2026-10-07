import "server-only";

import { prisma } from "@/lib/prisma";

export type JupiterGuideLinks = {
    appUrl: string;
    organizationRequestUrl: string;
    supportUrl: string;
    companyName: string;
};

function record(value: unknown): Record<string, unknown> {
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function safeLink(value: unknown): string {
    if (typeof value !== "string" || value.length === 0 || value.length > 2048) return "";
    if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !/[\u0000-\u001f]/u.test(value)) return value;
    try {
        const url = new URL(value);
        return url.protocol === "https:" && !url.username && !url.password ? url.toString() : "";
    } catch { return ""; }
}

export async function getJupiterGuideLinks(): Promise<JupiterGuideLinks> {
    const [guide, company] = await Promise.all([
        prisma.setting.findUnique({ where: { key: "site.jupiterGuide" }, select: { value: true, isPublic: true } }),
        prisma.setting.findUnique({ where: { key: "site.company" }, select: { value: true, isPublic: true } }),
    ]);
    const values = guide?.isPublic ? record(guide.value) : {};
    const companyValues = company?.isPublic ? record(record(company.value).fa) : {};
    const override = typeof values.companyName === "string" ? values.companyName.trim() : "";
    return {
        appUrl: safeLink(values.appUrl),
        organizationRequestUrl: safeLink(values.organizationRequestUrl),
        supportUrl: safeLink(values.supportUrl),
        companyName: override || (typeof companyValues.name === "string" ? companyValues.name : ""),
    };
}
