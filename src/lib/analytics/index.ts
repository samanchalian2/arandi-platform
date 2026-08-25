import { hashOpaqueToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";

export type AnalyticsInput = { visitorToken: string; sessionToken: string; path: string; language: "en" | "fa"; referrer: string | null; userAgent: string | null };

function opaque(value: unknown): string {
    if (typeof value !== "string" || !/^[A-Za-z0-9_-]{22,128}$/.test(value)) throw new Error("Analytics token is invalid.");
    return value;
}

function safePath(value: unknown): string {
    if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.length > 500 || value.includes("?") || value.includes("#")) throw new Error("Analytics path is invalid.");
    return value;
}

function referrerHost(value: string | null): string | null {
    if (!value || value.length > 2_048) return null;
    try { return new URL(value).hostname.toLowerCase().slice(0, 253) || null; } catch { return null; }
}

function device(userAgent: string | null) {
    const ua = (userAgent ?? "").toLowerCase();
    return {
        deviceCategory: /tablet|ipad/.test(ua) ? "tablet" : /mobile|android/.test(ua) ? "mobile" : "desktop",
        browserFamily: /edg\//.test(ua) ? "edge" : /firefox\//.test(ua) ? "firefox" : /chrome\//.test(ua) ? "chrome" : /safari\//.test(ua) ? "safari" : "other",
        osFamily: /windows/.test(ua) ? "windows" : /android/.test(ua) ? "android" : /iphone|ipad|mac os/.test(ua) ? "apple" : /linux/.test(ua) ? "linux" : "other",
    };
}

function source(host: string | null): string {
    if (!host) return "direct";
    if (/google\./.test(host)) return "search";
    if (/instagram\.com|linkedin\.com|t\.me|telegram\.me|whatsapp\.com|ble\.ir/.test(host)) return "social";
    return "referral";
}

export async function recordPageView(input: AnalyticsInput) {
    const visitorToken = opaque(input.visitorToken);
    const sessionToken = opaque(input.sessionToken);
    const path = safePath(input.path);
    const visitorTokenHash = hashOpaqueToken(visitorToken);
    const sessionTokenHash = hashOpaqueToken(sessionToken);
    const host = referrerHost(input.referrer);
    const client = device(input.userAgent);
    const now = new Date();
    const visitor = await prisma.analyticsVisitor.upsert({
        where: { tokenHash: visitorTokenHash },
        update: { lastSeenAt: now },
        create: { tokenHash: visitorTokenHash, lastSeenAt: now },
    });
    const session = await prisma.analyticsSession.upsert({
        where: { tokenHash: sessionTokenHash },
        update: { lastSeenAt: now },
        create: { visitorId: visitor.id, tokenHash: sessionTokenHash, languageCode: input.language, referrerHost: host, sourceCategory: source(host), ...client, lastSeenAt: now },
    });
    await prisma.analyticsPageView.create({ data: { sessionId: session.id, path, languageCode: input.language } });
}

export async function getAnalyticsSummary(days = 30) {
    const boundedDays = Math.min(Math.max(Number.isInteger(days) ? days : 30, 1), 365);
    const since = new Date(Date.now() - boundedDays * 86_400_000);
    const [pageViews, sessions, visitors, submissions, pageRows, sourceRows, deviceRows] = await Promise.all([
        prisma.analyticsPageView.count({ where: { createdAt: { gte: since } } }),
        prisma.analyticsSession.count({ where: { lastSeenAt: { gte: since } } }),
        prisma.analyticsSession.findMany({ where: { lastSeenAt: { gte: since } }, distinct: ["visitorId"], select: { visitorId: true } }),
        prisma.contactSubmission.count({ where: { createdAt: { gte: since } } }),
        prisma.analyticsPageView.groupBy({ by: ["path"], where: { createdAt: { gte: since } }, _count: { _all: true }, orderBy: { _count: { path: "desc" } }, take: 8 }),
        prisma.analyticsSession.groupBy({ by: ["sourceCategory"], where: { lastSeenAt: { gte: since } }, _count: { _all: true }, orderBy: { _count: { sourceCategory: "desc" } }, take: 8 }),
        prisma.analyticsSession.groupBy({ by: ["deviceCategory"], where: { lastSeenAt: { gte: since } }, _count: { _all: true }, orderBy: { _count: { deviceCategory: "desc" } }, take: 8 }),
    ]);
    return { days: boundedDays, pageViews, sessions, uniqueVisitors: visitors.length, submissions, conversionRate: sessions ? Math.round((submissions / sessions) * 10_000) / 100 : 0, topPages: pageRows.map((row) => ({ key: row.path, count: row._count._all })), sources: sourceRows.map((row) => ({ key: row.sourceCategory, count: row._count._all })), devices: deviceRows.map((row) => ({ key: row.deviceCategory, count: row._count._all })) };
}
